<!-- Copyright (C) 2017 The Android Open Source Project

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
-->
<template>
  <div class="tree-view">

    <div @click="clicked" class="trace-row" :class="computedClass">

      <span>
        <abbr v-bind:title="item.kind">
          <span class="kind" :class="getTypeClass(item)">
          </span>
        </abbr>

        <span>{{processItemName(item.name)}}</span>
  
        <span class="color-box"
              v-if="showColorBox(item)"
              :style="{ backgroundColor: getColorInfo(item.name) }">
        </span>
  
        <table class="matrix-box" v-if="showTransformMatrix(item.name)">
          <tr class="matrix-row">
              <td class="matrix-col">{{ getMatrixValue(item.name, 'dsdx:') }}</td>
              <td class="matrix-col">{{ getMatrixValue(item.name, 'dtdx:') }}</td>
          </tr>
          <tr class="matrix-row">
            <td class="matrix-col">{{ getMatrixValue(item.name, 'dsdy:') }} </td>
            <td class="matrix-col">{{ getMatrixValue(item.name, 'dtdy:') }}</td>
          </tr>
        </table>

      </span>

      <div v-for="c in item.chips" :title="c.long" :class="chipClassForChip(c)" :key="c.short">
        {{c.short}}
      </div>

      <abbr title="New">
        <div class="new-layer" v-if="shownewlayer && item && item.new === true">
            {{ '\u002B' }}
        </div>  
      </abbr>

      <abbr v-if="item.status === 1" :title="getStringForPreviousValue(item.was, item.status)">
        <div class="modified-layer" v-if="shownewlayer">
            {{ getStringForPropertyStatus(item.status) }}
        </div>
      </abbr>

    </div>

    <div class="children" v-if="children">
      <tree-view
        v-for="(c,i) in children"
        :item="c"
        @item-selected="childItemSelected"
        :selected="selected"
        :v-key="i"
        :key="i"
        :chip-class='chipClass'
        :filter="childFilter(c)"
        :flattened="flattened"
        :force-flattened="applyingFlattened"
        :shownewlayer="shownewlayer"
        v-show="filterMatches(c)" ref='children' />
    </div>

  </div>
</template>

<script>

import jsonProtoDefs from '../protos/windowmanagertrace.proto';
import protobuf from 'protobufjs';

let protoDefs = protobuf.Root.fromJSON(jsonProtoDefs);

if (process.env.NODE_ENV !== 'test') {
  let TraceMessage = protoDefs.lookupType("com.android.server.wm.WindowManagerTraceFileProto");
  let ServiceMessage = protoDefs.lookupType("com.android.server.wm.WindowManagerServiceDumpProto");
}


function getColorValue(str, search) {
  const elem_ind = str.indexOf(search);
  let elem = '';
  if (elem_ind !== -1) {
    const _str = str.substring(elem_ind + search.length);
    const spaceInd = _str.indexOf(' ');
    elem = _str.substr(0, spaceInd !== -1 ? spaceInd : _str.length);
  }
  return elem;
}

export default {
  name: 'tree-view',
  props: ['item', 'selected', 'chipClass', 'filter', 'flattened', 'force-flattened', 'shownewlayer'],
  data () {
    return {
    };
  },
  methods: {
    selectNext(found, parent) {
      if (found && this.filterMatches(this.item)) {
        this.clicked();
        return false;
      }
      if (this.selected === this.item) {
        found = true;
      }
      if (this.$refs.children) {
        for (let c of this.$refs.children) {
          found = c.selectNext(found);
        }
      }
      return found;
    },
    selectPrev(found) {
      if (this.$refs.children) {
        for (let c of [...this.$refs.children].reverse()) {
          found = c.selectPrev(found);
        }
      }
      if (found && this.filterMatches(this.item)) {
        this.clicked();
        return false;
      }
      if (this.selected === this.item) {
        found = true;
      }
      return found;
    },
    childItemSelected(item) {
      this.$emit('item-selected', item);
    },
    clicked() {
      this.$emit('item-selected', this.item);
    },
    chipClassForChip(c) {
      return ['tree-view-internal-chip', this.chipClassOrDefault, this.chipClassOrDefault + '-' + (c.class || 'default')];
    },
    filterMatches(c) {
      if (this.filter) {
        return this.filter(c, this.applyingFlattened);
      }
      return true;
    },
    childFilter(c) {
      if (this.filter && this.filter.includeChildren) {
        if (this.filterMatches(c)) {
          // Filter matched c, don't apply further filtering on c's children.
          return undefined;
        }
      }
      return this.filter;
    },
    getTypeClass(item) {
      let cssClass = '';
      /** TODO - good to include every 'kind' or type */
      switch(item.kind) {
        case 'entry':
          cssClass = 'entry';
          break;
        case 'layer':
          cssClass = 'layer';
          break;
        case '':
          cssClass = 'empty';
          break;
        default:
          cssClass = '';
          break;
      }
      return cssClass;
    },
    showColorBox(item) {
      if (item && item.name && item.name.indexOf('color:') !== -1) {
        return true;
      } else {
        return false;
      }
    },
    getColorInfo(name) {
      const searchText = 'color: ';
      if(typeof name.indexOf === 'undefined') {
        return 'none';
      }
      const ind = name.indexOf(searchText);
      if (ind === -1) {
        return 'none';
      }
      let str = name.substr(searchText.length, name.length);
      str = str.replace('↵', '');
      str = str.replace('\n', '');
      str = str.replace('  ', ' ');

      const r = getColorValue(str, 'r:');
      const g = getColorValue(str, 'g:');
      const b = getColorValue(str, 'b:');
      const a = getColorValue(str, 'a:'); 

      return `rgba(${r},${g},${b},${a})`;

    },
    showTransformMatrix(name) {
      if (name) {

        const isTransform = name.indexOf('transform:') !== -1 ||
                            name.indexOf('bufferTransform:') !== -1 ||
                            name.indexOf('requestedTransform:') !== -1 ||
                            name.indexOf('effectiveTransform:') !== -1;
        const search = 'dsdx:';
        const hasMatrixValues = this.getMatrixValue(name, search) != '';
  
        return isTransform && hasMatrixValues;
      } else {
        return false;
      }
    },
    getMatrixValue(str, search) {
      const elem_ind = str.indexOf(search);
      let elem = '';
      if (elem_ind !== -1) {
        const _str = str.substring(elem_ind + search.length);
        const spaceInd = _str.indexOf(' ');
        elem = _str.substr(0, spaceInd !== -1 ? spaceInd : _str.length);
      }
      return elem;
    },
    processItemName(name) {
      if (name && name.indexOf('transform:') !== -1) {
        if (this.showTransformMatrix(name)) {
          const search = 'dsdx:';
          const startInd = name.indexOf(search);
          if (startInd !== -1) {
            const str = name.substring(0, startInd);
            return str;
          } else {
            return name;
          }
        } else {
          return name;
        }
      } else {
        return name ? name : '';
      }
    },
    getStringForPropertyStatus(status) {
      /** Below status means the following: 
       *  - 0 = existing & same
          - 1 = existing & changed
          - 2 = new
       */
      return status === 1 ? '\u270E' /** Edit */ : status === 2 ? '\u002B' /** + New */ : '';
    },
    getStringForPreviousValue(was, status) {
      return status === 1 ? was : '';
    }
  },
  computed: {
    computedClass() {
      return (this.item == this.selected) ? 'selected' : 'not-selected'
    },
    chipClassOrDefault() {
      return this.chipClass || 'tree-view-chip';
    },
    applyingFlattened() {
      return this.flattened && this.item.flattened || this.forceFlattened;
    },
    children() {
      return this.applyingFlattened ? this.item.flattened : this.item.children;
    },
  }
}

</script>

<style>
.children {
  margin-left: 24px;
}
.properties .children .children:last-of-type .tree-view{
  border: 0.1px solid #dedbdb;

}
.kind {
  color: #333;
}
.selected {
  background-color: #3f51b5;
  color: white;
}
.selected .kind{
  color: #ccc;
}
.tree-view-internal-chip {
  display: inline-block;
}

.tree-view-chip {
  padding: 0 10px;
  border-radius: 10px;
  background-color: #aaa;
  color: black;
}

.new-layer {
  padding: 0 10px;
  border-radius: 10px;
  background-color: #4CAF50;
  color: white;
  display: inline-block;
}

.modified-layer {
  padding: 0 10px;
  border-radius: 10px;
  background-color: #4CAF50;
  color: white;
  display: inline-block;
}

.tree-view-chip.tree-view-chip-warn {
  background-color: #ffaa6b;
  color: black;
}

.tree-view-chip.tree-view-chip-error {
  background-color: #ff6b6b;
  color: black;
}

.trace-row {
    font-size: 12px;
    word-break: break-all;
}

.trace-row.not-selected:hover {
  background-color: #9ca6dc;
  cursor: pointer;
}

.trace-row.selected:hover {
  /* background-color: #f3f3f3; */
  cursor: pointer;
}

.layer {
  background-image: url("assets/layers.png");
  width: 16px;
  height: 16px;
  display: inline-block;
  margin-right: 5px;
}

.entry {
  background-image: url("assets/entry1.png");
  width: 16px;
  height: 16px;
  display: inline-block;
  margin-right: 5px;
}

.empty {
  display: none;
}

.color-box {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 0.5px solid #6f6e6e;
}

.matrix-box {
  border-collapse: collapse;
}

table.matrix-box, th, td {
    border: 0.1px solid #dedbdb;
}

.matrix-row {
    display: flex;
    justify-content: space-between;
}

.matrix-col {
  padding: 4px;
}

abbr[title] {
    border-bottom: none;
    cursor: inherit;
    text-decoration: none;
}


</style>

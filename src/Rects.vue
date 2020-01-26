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
  <div class="device-screen-background" id="device-screen-background">
    <div class="device-screen-container">
      <div class="bounds" :style="boundsStyle">
        <div class="rect" v-for="r in rects" :key="r.label" :style="rectToStyle(r)" @click="onClick(r)">
          <span class="label">{{r.label}}</span>
        </div>
        <div class="highlight" v-if="highlight" :style="rectToStyle(highlight)" />
      </div>
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

export default {
  name: 'rects',
  props: ['bounds', 'rects', 'highlight'],
  data () {
    return {
      vertical: true
    };
  },
  computed: {
    boundsC() {
      if (this.bounds) {
        return this.bounds;
      }
      let width = Math.max(...this.rects.map((r) => r.right));
      let height = Math.max(...this.rects.map((r) => r.bottom));
      return {width, height};
    },
    boundsStyle() {
      return this.rectToStyle({top: 0, left: 0, right: this.boundsC.width,
          bottom: this.boundsC.height});
    },
    desiredSize() {
      let min = Math.min(this.boundsC.width, this.boundsC.height);
      let max = Math.max(this.boundsC.width, this.boundsC.height);
      let aspect = min / max;
      return {width: 400, height: 400 * aspect};
    }
  },
  methods: {
    checkHorizontal() {
      return this.vertical ? 'dsb-horizontal' : '';
    },
    sx(sourceCoordinate) {
      const widthGreaterThanHeight = this.boundsC.width > this.boundsC.height;

      return widthGreaterThanHeight
              ? sourceCoordinate / this.boundsC.width * this.desiredSize.width
              : sourceCoordinate / this.boundsC.width * this.desiredSize.height;
    },
    sy(sourceCoordinate) {
      const widthSmallerThanHeight = this.boundsC.width < this.boundsC.height;

      return widthSmallerThanHeight
              ? sourceCoordinate / this.boundsC.height * this.desiredSize.width
              : sourceCoordinate / this.boundsC.height * this.desiredSize.height;
    },
    rectToStyle(r) {
      this.vertical = this.boundsC.width < this.boundsC.height;
      let x = this.sx(r.left);
      let y = this.sy(r.top);
      let w = this.sx(r.right) - this.sx(r.left);
      let h = this.sy(r.bottom) - this.sy(r.top);
      let t = r.transform;
      let tr = t ? `matrix(${t.dsdx}, ${t.dtdx}, ${t.dsdy}, ${t.dtdy}, ${this.sx(t.tx)}, ${this.sy(t.ty)})` : '';
      return `top: ${y}px; left: ${x}px; height: ${h}px; width: ${w}px;` +
             `transform: ${tr}; transform-origin: 0 0;`
    },
    onClick(r) {
      this.$emit('rect-click', r.ref);
    },
  },
  watch: {
    vertical() {
      const elem = document.getElementById("device-screen-background");
      if (!elem) {
        return;
      }
      if (!this.vertical) {
        elem.classList.add('dsb-horizontal');
        elem.classList.remove('device-screen-background');
        
      } else {
        elem.classList.add('device-screen-background');
        elem.classList.remove('dsb-horizontal');
      } 
    }
  },
}
</script>

<style scoped>

.bounds {
  background-color: #FF9800;
  position: relative;
  overflow: hidden;
}

.highlight, .rect {
  position: absolute;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end;
}

.rect {
  border: 1px solid black;
  background-color: rgba(128, 128, 128, 0.8);
}

.highlight {
  border: 2px solid red;
  pointer-events: none;
}

.label {
  align-self: center;
}

.device-screen-container {
  align-self: center;
}

.device-screen-container > div {
  border-radius: 15px;
}

.device-screen-background {
  background-image: url('assets/2_1_v.png');
  background-repeat: no-repeat;
  background-position: center center;
  display: flex;
  justify-content: center;
  width: 220px;
  height: 440px;
  align-self: center;
}

.dsb-horizontal {
  background-image: url('assets/2_1_h.png');
  background-repeat: no-repeat;
  background-position: center center;
  display: flex;
  justify-content: center;
  width: 440px;
  height: 220px;
  align-self: center;
}

</style>

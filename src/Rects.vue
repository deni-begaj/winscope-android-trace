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
  <div class="device-screen-background" :class="chooseClassBasedOnAspectRatio()" id="device-screen-background">
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

const possibleAspectRatios = [
  1,      //  1 : 1
  2,      // 16 : 8
  1.777,  // 16 : 9
  2.111   // 19 : 9
];

export default {
  name: 'rects',
  props: ['bounds', 'rects', 'highlight'],
  data () {
    return {
      vertical: true,
      aspect: null,
      size: { width: null, height: null }
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
    }
  },
  created() {
    this.vertical = this.boundsC.width < this.boundsC.height;
    this.calcAspectRatioAndSize();
    this.chooseClassBasedOnAspectRatio();
  },
  methods: {
    calcAspectRatioAndSize() {
      let min = Math.min(this.boundsC.width, this.boundsC.height);
      let max = Math.max(this.boundsC.width, this.boundsC.height);
      this.aspect = min / max;
      this.size = { width: 400, height: 400 * this.aspect };
    },
    sx(sourceCoordinate) {
      return !this.vertical
              ? sourceCoordinate / this.boundsC.width * this.size.width
              : sourceCoordinate / this.boundsC.width * this.size.height;
    },
    sy(sourceCoordinate) {
      return this.vertical
              ? sourceCoordinate / this.boundsC.height * this.size.width
              : sourceCoordinate / this.boundsC.height * this.size.height;
    },
    rectToStyle(r) {
      this.vertical = this.boundsC.width < this.boundsC.height;

      let t = r.transform;
      let tr = t ? `matrix(${t.dsdx}, ${t.dtdx}, ${t.dsdy}, ${t.dtdy}, ${this.sx(t.tx)}, ${this.sy(t.ty)})` : '';

      let x = this.sx(r.left);
      let y = this.sy(r.top);
      let w = this.sx(r.right) - this.sx(r.left);
      let h = this.sy(r.bottom) - this.sy(r.top);

      return `top: ${y}px; left: ${x}px; height: ${h}px; width: ${w}px; transform: ${tr}; transform-origin: 0 0;`
    },
    onClick(r) {
      this.$emit('rect-click', r.ref);
    },
    chooseClassBasedOnAspectRatio() {
      debugger;
      const aspect = this.aspect < 1 ? 1 / this.aspect : this.aspect;
      const rightAR = possibleAspectRatios.reduce((prev, curr) => {
        return Math.abs(curr - aspect) < Math.abs(prev - aspect) ? curr : prev;
      });

      const allClasses = ['ar-1', 'ar-2_h', 'ar-2_v', 'ar-1-777_h', 'ar-1-777_v', 'ar-2-111_h', 'ar-2-111_v'];
      let addClass = null;
      let removeClasses = null;

      switch(rightAR) {
        case 1:
            addClass = 'ar-1';
            break;
        case 1.777:
            addClass = this.vertical ? 'ar-1-777_v' : 'ar-1-777_h';
            break;
        case 2:
            addClass = this.vertical ? 'ar-2_v' : 'ar-2_h';
            break;
        case 2.111:
            addClass = this.vertical ? 'ar-2-111_v' : 'ar-2-111_h';
            break;
        default:
          console.warn('Came to default of switch');
          break;
      }

      removeClasses = allClasses.filter((el) => el !== addClass);

      return addClass;  

    }
  },
  watch: {
    vertical() {
      this.chooseClassBasedOnAspectRatio();
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
  background-repeat: no-repeat;
  background-position: center center;
  display: flex;
  justify-content: center;
  align-self: center;
}

.dsb-horizontal {
  /* background-image: url('assets/2_1_h.png'); */
  width: 440px;
  height: 220px;
}



/* Aspect Ratio 1 : 1 */
.ar-1 {
  background-image: url('assets/1_1.png');
  width: 440px;
  height: 440px;
}


/* Aspect Ratio 2 : 1 */
.ar-2_h {
  background-image: url('assets/2_1_h.png');
  width: 440px;
  height: 240px;
}

.ar-2_v {
  background-image: url('assets/2_1_v.png');
  width: 240px;
  height: 440px;
}


/* Aspect Ratio 16 : 9 */
.ar-1-777_h {
  background-image: url('assets/16_9_h.png');
  width: 440px;
  height: 265px;
}

.ar-1-777_v {
  background-image: url('assets/16_9_v.png');
  width: 265px;
  height: 440px;
}


/* Aspect Ratio 19 : 9 */
.ar-2-111_h {
  background-image: url('assets/19_9_h.png');
  width: 230px;
  height: 440px;
}

.ar-2-111_v {
  background-image: url('assets/19_9_v.png');
  width: 230px;
  height: 440px;
}

</style>

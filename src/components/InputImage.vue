<template>
  <div class="input-image">
    <input
      type="file"
      id="file-slector"
      accept="image/*"
      ref="preview"
      @change="loadImage"
      hidden
    />
    <button class="text-button" @click="selectFile">ファイルを選択</button>
  </div>
</template>

<script>
import loadImageSync from "@/js/load-image-sync";
export default {
  name: "InputImage",
  props: {},
  data: function () {
    return {};
  },
  methods: {
    selectFile: function () {
      document.querySelector("#file-slector").click();
    },
    loadImage: async function () {
      if (this.$refs.preview.files.length === 0) return;

      const file = this.$refs.preview.files[0];
      const url = URL.createObjectURL(file);
      const image = await loadImageSync(url);
      this.$emit("load-image", image);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input[type="file"] {
  display: none;
}

.text-button {
  background-color: #000000;
  color: #ffffff;
  width: 120px;
  height: 30px;
  border-radius: 18px;
  border: transparent 2px solid;
}

.text-button:active {
  background-color: #222222;
}

.text-button:focus {
  background-color: #ffffff;
  border: #000000 2px solid;
  color: #000000;
}
</style>

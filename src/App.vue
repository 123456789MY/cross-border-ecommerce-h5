<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useUserStore } from './store/user'

onLaunch(() => {
  console.log("App Launch");
  const userStore = useUserStore()
  userStore.initUserInfo()
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style></style>

<template>
  <div id="navbar-expand-md">
    <nav class="navbar navbar-default">
      <div class="container">
        <router-link to="/"><a class="navbar-brand" href="#">
          <i class="glyphicon glyphicon-tree-conifer"></i>
          Predictive Deer Tracker
        </a>
        </router-link>
        <ul class="nav navbar-nav">
          <router-link tag="li" to="/" class="nav-item"><a>Home</a></router-link>
          <router-link tag="li" to="/tracking" class="nav-item"><a>Tracking</a></router-link>
          <router-link tag="li" to="/gallery" class="nav-item"><a>Gallery</a></router-link>
          <router-link tag="li" to="/login" class="nav-item"><a>Login</a></router-link>
        </ul>
      </div>
    </nav>
    <div class="container">
      <!-- <div class="col-sm-4">
        <sidebar></sidebar>
      </div>
      <div class="col-sm-8"> -->
        <router-view></router-view>
      </div>
    <!-- </div> -->
  </div>
</template>

<script>
// import Sidebar from './components/Sidebar'
// import store from './store';

// export default {
//   components: {'sidebar': Sidebar},
//   computed: {
//     totalTime() {
//       return store.state.totalTime;
//     }
//   }
// };
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

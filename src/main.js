// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue 			from 'vue'
import App 			from './App'
import Home 		from './components/Home'
import Tracking 	from './components/Tracking'
import LogTime 		from './components/LogTime'
import Gallery		from './components/Gallery'
import Login		from './components/Login'

import VueRouter 	from 'vue-router'
import VueResource 	from 'vue-resource'

import moment 		from 'moment'

Vue.use(VueResource)
Vue.use(VueRouter)

Vue.prototype.moment = moment;

const router = new VueRouter({
	routes: [
		{ path: '/', component: Home},
		{ path: '/home', component: Home},
		{ path: '/tracking', component: Tracking,
			children: [
				{
					path: 'log-time',
					component: LogTime
				}
			]
		},
		{ path: '/gallery', component: Gallery},
		{ path: '/login', component: Login},
		{ path: '*', redirect: '/home'}
	],
	mode: 'history' 
})

var bus = new Vue({});

/* eslint-disable no-new */
const app = new Vue({
	router,
	data: {
		bus: bus
	},
	render: h => h(App)
}).$mount('#app')

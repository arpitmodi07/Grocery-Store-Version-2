import router from "./router.js"
import Navbar from "./components/Navbar.js"
// create virtual env of  using python version 3.7


// router.beforeEach((to,from,next) => {
//     // if(to.name=='UserForm') next({name :'UserForm'})
//     if ((to.name !== 'Login' && to.name !=='UserForm')  && !localStorage.getItem('auth-token')? true : false) next({ name: 'Login'})
//     else next()
// })



router.beforeEach((to, from, next) => {
    const authToken = localStorage.getItem('auth-token');
  
    if (to.name !== 'Login' && to.name !== 'UserForm' && to.name!=='ManagerForm' && !authToken) {
      next({ name: 'Login' });
    } else {
      next();
    }
  });
  





// router.js



new Vue({
    el:"#app",
    template:`<div>
    <Navbar :key='has_changed'/><br>
    <router-view class="m-3"/>
    </div>`,
    router,
    components:{
        Navbar,
    },
    data:{
        has_changed:true,
    },
    watch: {
        $route(to,from){
            this.has_changed=!this.has_changed
        }
    },

    
})
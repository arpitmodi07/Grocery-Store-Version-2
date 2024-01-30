// Synchronous code will run sequentially in the order they appear in the code and asycnhronous
// operations do not block the program execution means the other next part of the code will run 
// and do not wait for the function to complete first so it will prevent from freezing suppose if 
// you use set timeout or fetching the data then async operations comes into a picture..

export default {
    template :`
    <div class='d-flex justify-content-center' style="margin-top :15 vh">  
        <div class="mb-3 p-5 bg-light">
        <div class='d-flex justify-content-center'><h3>Login</h3></div>
        <div class='text-danger text-center'>{{error}}</div>
        <label for="user-email" class="form-label">Email address</label>
        <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">
        <label for="user-password" class="form-label">Password</label>
        <input type="password" class="form-control" id="user-password" v-model="cred.password">
        <button class="btn btn-primary mt-2" @click="login">Login</button><br><br>
        <h5> New to website? </h5><br>
        <button class="btn btn-success" @click="signin_cust"> Signin as customer</button>
        <button class="btn btn-success" @click="signin_mang"> Signin as manager </button>
        </div>
        
        
    </div>`,

    data(){
        return{
            cred: {
            email:null,
            password:null,
        },
        error:null
    }
  },
  methods:{
    async login(){
        const res = await fetch('/user-login',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body: JSON.stringify(this.cred),
        })
        const data = await res.json()
        if (res.ok){
            // console.log(data)
            localStorage.setItem('auth-token',data.token)
            localStorage.setItem('role',data.role)
            localStorage.setItem('id',data.id)
            this.$router.push({path:'/'})
        }
        else{
            this.error=data.message
        }
        
    },

    async signin_cust(){
        
        this.$router.push('/create_user')
    },

    async signin_mang(){
        
        this.$router.push('/create_manager')
    }
  }
}


// navigate path navigate guard before navigate guard
export default{
    template:`<div class='d-flex justify-content-center' style="margin-top :15 vh">  
    <div class="mb-3 p-5 bg-light">
    <div class='d-flex justify-content-center' style='color: navy;'><h3>User Registration Form</h3></div>

    <div class='text-danger text-center'>{{error}}</div>
    <label for="mang-name" class="form-label">Enter Your Name</label>
    <input type="text" class="form-control" id="mang-name" placeholder="Enter your name" v-model="user.name"/>
    <label for="mang-email" class="form-label">Enter Your Email Address </label>
    <input type="email" class="form-control" id="mang-email" placeholder="Email" v-model="user.email"/>

    <label for="mang-pass" class="form-label">Enter Password </label>
    <input type="password" class="form-control" id="mang-pass" placeholder="Password" v-model="user.password"/>

    <label for="mang-rep" class="form-label">Repeat Password </label>
    <input type="password" class="form-control" id="mang-rep" placeholder="Repeat Password" v-model="user.repeat_pass"/>
    <button class="btn btn-success" @click="create_user">Submit</button>
    
    </div>`,

    data(){
        return{
            user:{
                name:null,
              
                email:null,
                password:null,
                repeat_pass:null,
                roles:'user',
            },
            error:null
        }
    },
        methods:{
            async create_user(){
                
                const res= await fetch('/api/user',{
                    
                    method:'POST',
                    headers:{
                        "Content-Type":'application/json',
                    },
                    body: JSON.stringify(this.user),
                })
            const data = await res.json()
            console.log(data)
            if(res.ok){
                alert(data.message)
                this.$router.push('/')
            }
            else{
                this.error=data.message
                
            }
            }
        }
    
}
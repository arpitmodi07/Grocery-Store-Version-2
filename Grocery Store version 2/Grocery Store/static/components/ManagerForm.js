export default{
    template:`<div class='d-flex justify-content-center' style="margin-top :15 vh">  
    <div class="mb-3 p-5 bg-light">
    <div class='d-flex justify-content-center'><h3>Manager Registration Form</h3></div>
    <div class='text-danger text-center'>{{error}}</div>
    <label for="mang-name" class="form-label">Enter Your Name</label>
    <input type="text" class="form-control" id="mang-name" placeholder="Enter your name" v-model="manager.name"/>

    <label for="mang-email" class="form-label">Enter Your Email Address </label>
    <input type="email" class="form-control" id="mang-email" placeholder="Email" v-model="manager.email"/>
    <label for="mang-pass" class="form-label">Enter Password </label>
    <input type="password" class="form-control" id="mang-pass" placeholder="Password" v-model="manager.password"/>
    <label for="mang-rep" class="form-label">Repeat Password </label>
    <input type="password" class="form-control" id="mang-rep" placeholder="Repeat Password" v-model="manager.repeat_pass"/><br>
    <button class="btn btn-success" @click="create_manager">Submit</button>
    
    </div>
    </div>`,

    data(){
        return{
            manager:{
                name:null,
              
                email:null,
                password:null,
                repeat_pass:null,
                roles:'mang',
            },
            error:null
        }
    },
        methods:{
            async create_manager(){
                
                const res= await fetch('/api/manager',{
                    
                    method:'POST',
                    headers:{
                        "Content-Type":'application/json',
                    },
                    body: JSON.stringify(this.manager),
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
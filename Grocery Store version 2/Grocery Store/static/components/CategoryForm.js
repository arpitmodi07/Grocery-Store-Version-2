export default{
    template:`<div class="text-center mt-5">
    <h1 class="mb-4">Create New Category</h1>
    <div class="form-group">
      <input type="text" class="form-control" placeholder="Enter Category name" v-model="details.name" />
    </div>
    <button class="btn btn-success mt-3" @click="create_category">Submit</button>
  </div>`,
    data(){
        return{
            details:{
                name:null,
                id:localStorage.getItem('id'),
            },
            token:localStorage.getItem('auth-token'),
            role:localStorage.getItem('role')
            
        }
    },
    methods:{
        async create_category(){
            const res = await fetch('/api/category',{
                method: 'POST',
                headers:{
                    'Authentication-Token':this.token,
                    "Content-Type":'application/json',
                },
                body: JSON.stringify({
                    name:this.details.name,
                    id:this.details.id,
                    role:this.role,
                }),
            })
            const data = await res.json()
            if (res.ok){
               alert(data.message),
               this.$router.push('/')
            }
            else{
                alert("Something went wrong")
            }
        }
    }
}
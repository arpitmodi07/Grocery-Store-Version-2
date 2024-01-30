export default{
    template:`<div><h2>{{role}}</h2>
    <h3>ID:{{category.id}}
     Name:{{category.name}}
     Creator:{{category.creator}}
     Approved:{{category.is_approved}}
     <button @click="approveCategory" class="btn btn-success" v-if="!category.is_approved && role=='admin'">Approve</button></h3>
     </div>`,
    props:['category'],
    data(){
        return{
            role:localStorage.getItem('role'),
            authToken:localStorage.getItem('auth-token'),
        }
    }
}
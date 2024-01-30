import UserHome from "./UserHome.js"
import AdminHome from "./AdminHome.js"
import ManagerHome from "./ManagerHome.js"
import Category from "./Category.js"
import Product from "./Product.js"
import CategoryHome from "./CategoryHome.js"

export default{
    template:`<div>
    
     
    <UserHome v-if="userRole=='cust'"/>
    <AdminHome v-if="userRole=='admin'"/>
    <ManagerHome v-if="userRole=='mang'"/>
    <Category v-if="userRole=='admin'":category = "category" />
    <Product :product="product" :category="category"  v-if="userRole!='admin'"/>
    


    
    </div>`,
    data(){
        return{
            userRole:localStorage.getItem('role'),
            authToken:localStorage.getItem('auth-token'),
            category:[],
            product:[]
        }
    },
    components:{
        UserHome,
        AdminHome,
        ManagerHome,
        Category,
        Product,
        CategoryHome
    },
    async mounted(){
        const res = await fetch('/api/category',{
            headers:{
                'Authentication-Token':this.authToken,
            }
        })
        const data = await res.json()
        if (res.ok){
            this.category = data
        }
        else{
            alert(data.message)
        }


        const res1 = await fetch('/api/product',{
            headers:{
                'Authentication-Token':this.authToken,
            }
        })
        const data1 = await res1.json()
        if (res1.ok){
            this.product = data1
        }
        else{
            alert(data1.message)
        }

    }
}
const mongoose=require('mongoose')
const dotenv=require('dotenv')
dotenv.config()


const connectDB=async()=>
    {
        try{
            await mongoose.connect(process.env.MONGOCLIENT)
            console.log("connnected  mongodb")  
        }
        catch(error){
              console.log("ERROR!")  
              process.exit(1)
        }
    }
    module.exports=connectDB;

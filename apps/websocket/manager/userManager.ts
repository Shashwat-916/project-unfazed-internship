
export class UserManager{

    private static instance:UserManager
    private users = []
    
    private constructor(){}

    static getInstance (){
        if(!this.instance){
            return new UserManager()
        }
        else{
            return this.instance
        }
    }

    addUser(){}

    removeUser(){}



}
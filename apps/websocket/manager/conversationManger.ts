export class ConversationManager{

    private static instance:ConversationManager
    private conversations = []
    
    private constructor(){}

    static getInstance (){
        if(!this.instance){
            return new ConversationManager()
        }
        else{
            return this.instance
        }
    }

    

    
}
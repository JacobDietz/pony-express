import { useCreateChatMutation } from "../data/mutations/mutations";
import { useContext,  useState } from "react";
import { AuthContext } from "../auth";

function CreateChatPopUp({ className, onClose }) {
    const {id, headers } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [showButton, setShowButton] = useState(false);
    const {mutate: createChatMutation } = useCreateChatMutation(headers, name, id);
    const createButtonClass = showButton ? "bg-gray-300 w-1/4 rounded-md hover:bg-gray-100" : "hidden"

    
    return (
        
             <div id="createChatPopUp" className={`${className} fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800/80 
                    z-50 w-[30svw] h-[30svh] 
                    border-none rounded-sm
                    z-50 flex-col shadow-2xl shadow-slate-900 

                    `}> 

                    {/* exit button */}
                <button
                    className="z-10 flex justify-center hover:bg-gray-700 bg-gray-200 size-6
                    rounded-full text-white "
                    onClick={onClose}><p>x</p></button>
           
                <form
                    id="createChatForm"
                    onSubmit={(e) => {
                        e.preventDefault(); 
                        createChatMutation();
                      }}
                >
                    <div className="flex flex-col items-center justify-center py-2">
                        <p className="text-gray-400 text-xl md:text-4xl text-white font-doto"> Enter chat name</p>
                            <input
                                id="chat-name-input"
                                className="focus:border-blue-100 w-1/2 h-1/5 border-2 border-gray-300 rounded-lg shrink outline-none my-4 text-white "
                                type="text"
                                onChange={(e) => {
                                    setName(e.target.value);
                                    e.target.value.length == 0 ? setShowButton(false) : setShowButton(true);
                                     
                                }}
                            />
                        
                        <input 
                        className={createButtonClass} type="submit" 
                        disabled={!showButton} value="create"></input> 
                        </div>
                </form>
            </div>
    

    )
}

export { CreateChatPopUp }
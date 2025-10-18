import { useCreateChatMutation } from "../data/mutations/mutations";
import { useContext, useState } from "react";
import { AuthContext } from "../auth";

function CreateChatPopUp({ onClose }) {
    const {id, headers } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [showButton, setShowButton] = useState(false);
    const {mutate: createChatMutation } = useCreateChatMutation(headers, name, id);

    return (

        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex justify-center items-center">
            {/* <div className="bg-[rgba(254,254,254,0.98)] w-1/3 h-1/3 border-3 border-red-100 rounded-xl"> */}
            <div className="bg-[url(../src/assets/images/backdrop.jpg)] bg-cover bg-no-repeat bg-center w-1/3 h-1/3 border-none
            border-red-100 rounded-xl">

                <button
                    className="hover:bg-[rgba(0,0,0,0.1)] bg-[rgba(227,171,174,0.4)]
                    rounded-full text-white relative -top-3 -left-3 size-7"
                    onClick={onClose}
                >X</button>

                <form
                    id="createChatForm"
                    onSubmit={(e) => {
                        e.preventDefault(); 
                        createChatMutation();
                      }}
                >
                    <div className="flex flex-col items-center justify-center py-10">
                        <p className="text-gray-400 text-7xl text-white font-doto font-bold"> Enter chat name</p>
                            <input
                                className="focus:border-red-300 w-1/2 h-1/5 border-2 border-red-200 rounded-lg shrink outline-none my-4 text-white "
                                //value={password}
                                type="text"
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setShowButton(true);
                                }}
                            />
                        
                        {showButton && <button 
                        className="bg-gray-300 w-1/4 rounded-md hover:bg-gray-100"
                        type={"submit"}
                        >Create</button> }
                        </div>
                </form>
            </div>
        </div>

    )
}

export { CreateChatPopUp }
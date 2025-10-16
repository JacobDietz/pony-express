import { NavLink, useMatch, useParams } from "react-router";
import { useAllChats } from "./queries";
import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "./auth";

export default function ChatNav({ onOpenCreateChat }) {
    const { id } = useParams();
    const allChats = useAllChats();
    const { username, logout } = useContext(AuthContext);


    return (
        <section id="completeNav" className="self-center h-1/2 w-1/4 md:w-[280px] flex-col flex-shrink-0 md:h-95/100 text-center bg-white/30 rounded-xl drop-shadow-2xl border border-zinc-200 p-4 overflow-y-auto">

            <h1 className="md:mt-2 font-shadow-lg text-c-darker-blue mb-2 font-sans font-semibold 
            md:text-2xl  box-shadow-2xl">Pony Express</h1>

            <p className="bg-opacity-10 text-white text-shadow-xl font-doto tracking-wide
 font-stretch-ultra-condensed md:text-4xl">{username}</p>
            <p className="text-blue-900 hover:text-blue-300 text-xs mb-3"><a href="/settings">settings</a></p>


            <ChatList allChats={allChats || []}></ChatList>
            <CreateChat onClick={onOpenCreateChat}></CreateChat>
            <button className="tracking-tight font-stretch-none shadow-lg font-semibold text-white font-medium hover:text-white mb-5
                    rounded-lg p-1 bg-white/20 box-shadow-xl hover:bg-gray-300 w-3/4 "
                onClick={logout}
            >log out</button>



        </section>
        //</div>
    );
}

function ChatList({ allChats }) {
    return (
        <ul className="overflow-scroll overflow-y-auto no-scrollbar 
      h-1/3 my-5 tracking-wide">
            {allChats.map((chat) => (
                <ChatItem name={chat.name} id={chat.id} key={chat.id}>{chat.name}</ChatItem>
            ))}
        </ul>
    );
}

function ChatItem({ name, id }) {
    let baseTextClass = "border-2 opacity-80 rounded-xl font-ubuntu font-semibold text-xs lg:text-xl "
    const currentClass = useMatch(`/chats/${id}`);
     const liClassName = currentClass
        ? baseTextClass + "text-red-300 border-red-300"
        : baseTextClass + "hover:border-sage text-zinc-900 border-c-light-blue"
    return (
        <li className={liClassName}>
            <NavLink to={`/chats/${id}`}>{name}</NavLink>
        </li>
    );
}











function CreateChat({ onClick }) {


    return (
        <button
            className="bg-blue-400 shadow-md rounded-xl w-3/5 h-10 text-xs text-white hover:bg-blue-200  "
            onClick={onClick}

        > Create Chat </button>
    )

}

function CreateChatPopUp({ onClose }) {
    const [name, setName] = useState('');
    const [showButton, setShowButton] = useState(false);

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
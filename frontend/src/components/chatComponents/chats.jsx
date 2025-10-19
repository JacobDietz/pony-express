import { NavLink, useMatch, useParams } from "react-router";
//import { useAllChats } from "../queries";
import { useAllChats } from "../../data/queries/queries";
import { useState } from "react";
import { useContext } from "react";
//import { AuthContext } from "./auth";
import { AuthContext } from "../../auth";

export default function ChatNav({ onOpenCreateChat }) {
    const { id } = useParams();
    const allChats = useAllChats();
    const { username, logout } = useContext(AuthContext);

    return (
        <section id="chatComponent" className="text-center bg-white/30 rounded-xl drop-shadow-2xl border border-zinc-200 p-4 overflow-y-auto">

            <h1 className="mt-2 font-shadow-lg text-c-darker-blue mb-2 font-sans font-semibold text-2xl opacity-100 box-shadow-2xl">Pony Express</h1>

            <p className="bg-opacity-10 text-white text-shadow-xl font-doto tracking-wide
 font-stretch-ultra-condensed text-4xl">{username}</p>
            <p className="text-blue-900 hover:text-blue-300 text-xs mb-3"><a href="/settings">settings</a></p>


            <ChatList allChats={allChats || []}></ChatList>
            <CreateChat onClick={onOpenCreateChat}></CreateChat>
            <button className="tracking-tight font-stretch-none shadow-lg font-semibold text-white font-medium hover:text-white mb-5
                    rounded-lg p-1 bg-white/20 box-shadow-xl hover:bg-gray-300 w-3/4 "
                onClick={logout}
            >log out</button>



        </section>
    );
}   



function ChatList({ allChats }) {
    return (
        <ul id="chatlist" className="flex flex-col gap-y-4 overflow-y-scroll no-scrollbar font-ubuntu text-white tracking-wide font-semibold text-2xl">
            {allChats.map((chat) => (
                <ChatItem name={chat.name} id={chat.id} key={chat.id}>{chat.name}</ChatItem>
            ))}
        </ul>
    );
}

function ChatItem({ name, id }) {
    const match = useMatch(`/chats/${id}`);
    const liClassName = match
        ? "border-2 border-c-light-blue opacity-80 rounded-xl text-gray-100 font-bold"
        : "hover:border-2 hover:border-sage hover:rounded-xl opacity-80 text-zinc-900 mt-2 mx-5";
    return (
        <li className={liClassName}>
            <NavLink to={`/chats/${id}`}>{name}</NavLink>
        </li>
    );
}

function CreateChat({ onClick }) {

    return (
        <button
           // className="bg-blue-400 shadow-md rounded-xl w-3/5 h-10 mb-3 text-white hover:bg-blue-200  "

            className="bg-[rgb(18, 18, 18)] shadow-md rounded-xl w-3/5 h-10 mb-3 text-white hover:bg-blue-200  "
            onClick={onClick}

        > Create Chat </button>
    )

}

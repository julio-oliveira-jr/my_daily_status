import React from 'react'
import Link from 'next/link'

const NavLink = ({href, children}) => {
    return (
        <Link href={href}>
            <a className='p-2 houver:underline houver:text-red-800'>{children}</a>
           </Link>    
    )
}

const NavBar = () => {
    return(
        <div className='bg-gray-500 py-4 text-center'>
        <NavLink href='/sobre'>Sobre</NavLink>
        <NavLink href='/api/login'>Cadastro</NavLink>
        <NavLink href='/api/login'>Entrar</NavLink>
        </div>
    )
}
export default NavBar
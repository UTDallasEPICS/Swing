//import Home from '../public/Home.svg'
import Link from 'next/link'
import Image from 'next/image'
export default function HomeButton(){
    return (
        <Link href="/">
            <button className="transition-all duration-300 hover:brightness-125 hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.7)]">
                <Image src="/Home.svg" alt="Button" width={60}
                height={60}/>
            </button>
        </Link>
    )
}
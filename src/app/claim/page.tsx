import { IoMdArrowRoundBack } from "react-icons/io";
import Link from 'next/link';

export default function Claim() {
  return (
    <div className="min-h-screen bg-[#15161B]">
        <Link
          href="/"
          className="absolute top-[3%] left-[3%] px-4 py-2 text-gray-500"
        >
          <IoMdArrowRoundBack size={30} />
        </Link>
    </div>
  )
}
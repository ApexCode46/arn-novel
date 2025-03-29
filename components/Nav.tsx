import Themes from "./ui/theme";
import Account from "./ui/account";
import { Search } from "lucide-react"
import Link from "next/link";

export default function Nav() {
    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between py-4 px-6 bg-backgroundCustom text-foreground drop-shadow-md  ">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold mr-10">
              ARN NOVEL
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/#" className="flex hover:text-primary transition-colors">
                <Search className="mr-2"/>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="md:hidden">
              hidden
            </button>
            <Themes />
            <Account />
          </div>
        </nav>
      );
    }
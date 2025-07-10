import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import Image from "next/image";
export default function Ranking() {
  return (
    <>
      <Card className="w-full my-5 drop-shadow-md bg-backgroundCustom">
        <CardContent className="flex">
          <div className="mr-5">
            <Image
              src="/novelImg/Test-novel.png"
              alt={`Advertisement`}
              width={300}
              height={100}
              className="object-contain rounded"
            />
            <p className="text-base font-bold truncate">Novel A</p>
          </div>
          <div className="w-full">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor optio
            veritatis itaque numquam nihil architecto distinctio repudiandae
            illo, eligendi, illum ipsa omnis dolore consequuntur fugiat soluta,
            maiores aliquid rem. Suscipit?
          </div>
        </CardContent>
      </Card>

      <Card className="w-full my-5 drop-shadow-md bg-backgroundCustom">
        <CardContent className="flex">
          <div className="mr-5">
            <Image
              src="/novelImg/Test-novel.png"
              alt={`Advertisement`}
              width={300}
              height={100}
              className="object-contain rounded"
            />
            <p className="text-base font-bold truncate">Novel B</p>
          </div>
          <div className="w-full">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor optio
            veritatis itaque numquam nihil architecto distinctio repudiandae
            illo, eligendi, illum ipsa omnis dolore consequuntur fugiat soluta,
            maiores aliquid rem. Suscipit?
          </div>
        </CardContent>
      </Card>

      <Card className="w-full my-5 drop-shadow-md bg-backgroundCustom">
        <CardContent className="flex">
          <div className="mr-5">
            <Image
              src="/novelImg/Test-novel.png"
              alt={`Advertisement`}
              width={300}
              height={100}
              className="object-contain rounded"
            />
            <p className="text-base font-bold truncate">Novel C</p>
          </div>
          <div className="w-full">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor optio
            veritatis itaque numquam nihil architecto distinctio repudiandae
            illo, eligendi, illum ipsa omnis dolore consequuntur fugiat soluta,
            maiores aliquid rem. Suscipit?
          </div>
        </CardContent>
      </Card>
    </>
  );
}

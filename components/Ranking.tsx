import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
export default function Ranking() {
  return (
    <>
    <h3>ยอดนิยม</h3>
    <Card className="w-full my-5">
        <CardContent className="flex">
      <div className="mr-5">
        <img src="https://picsum.photos/200/300" alt="lorem"/>
      </div>
      <div className="w-full">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor optio veritatis itaque numquam nihil architecto distinctio repudiandae illo, eligendi, illum ipsa omnis dolore consequuntur fugiat soluta, maiores aliquid rem. Suscipit?
    </div>
        </CardContent>
    </Card>

    <Card className="w-full my-5">
        <CardContent className="flex">
      <div className="mr-5">
        <img src="https://picsum.photos/200/300" alt="lorem"/>
      </div>
      <div className="w-full">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor optio veritatis itaque numquam nihil architecto distinctio repudiandae illo, eligendi, illum ipsa omnis dolore consequuntur fugiat soluta, maiores aliquid rem. Suscipit?
    </div>
        </CardContent>
    </Card>

    <Card className="w-full my-5">
        <CardContent className="flex">
      <div className="mr-5">
        <img src="https://picsum.photos/200/300" alt="lorem"/>
      </div>
      <div className="w-full bg-amber-600">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor optio veritatis itaque numquam nihil architecto distinctio repudiandae illo, eligendi, illum ipsa omnis dolore consequuntur fugiat soluta, maiores aliquid rem. Suscipit?
    </div>
        </CardContent>
    </Card>
    <Button variant="outline">Button</Button>

    </>
  );
}

import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Rocket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Page = () => {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-16 outline-2 outline-red-400">
      <div className="flex flex-col items-center justify-center gap-6">
        <h2 className="text-6xl font-semibold">
          Welcome to Dimas's Thesis VTT Research
        </h2>
        <p>Your contribution will help him finish his thesis!</p>
      </div>
      <div>
        <div className="flex gap-8">
          <Button className={`cursor-pointer`}>
            <Rocket />
            Start
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Setup Tester Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tester Profile</DialogTitle>
                <DialogDescription>
                  Setup your tester profile to uniquely separate tester
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supervisor" className="text-right">
                    Supervisor
                  </Label>
                  <Input
                    id="supervisor"
                    defaultValue="cloudims300803_"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tester" className="text-right">
                    Tester
                  </Label>
                  <Input
                    id="tester"
                    defaultValue="Prof Dr. Riyadi"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="institution" className="text-right">
                    Institution
                  </Label>
                  <Input
                    id="institution"
                    defaultValue="Universitas Airlangga"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="faculty" className="text-right">
                    Faculty
                  </Label>
                  <Input
                    id="faculty"
                    defaultValue="Kedokteran Hewan"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">
                    Department
                  </Label>
                  <Input
                    id="department"
                    defaultValue="Pendidikan Kedokteran Hewan"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="speciality" className="text-right">
                    Speciality
                  </Label>
                  <Input
                    id="speciality"
                    defaultValue="Sel"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </main>
  );
};

export default Page;

"use client";

import { useContext, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { UserContext } from "@/provider/UserProvider";
import { toast } from "sonner";

function DialogSign() {
  const [open, setOpen] = useState(false);

  const {
    supervisor,
    tester,
    institution,
    faculty,
    department,
    speciality,
    setSupervisor,
    setTester,
    setInstitution,
    setFaculty,
    setDepartment,
    setSpeciality,
  } = useContext(UserContext);

  const handleSave = () => {
    // Save the information
    console.log("Profile saved:", {
      supervisor,
      tester,
      institution,
      faculty,
      department,
      speciality,
    });

    // toast("Profile saved successfully", {
    //   variant: "success",
    //   description: "Your tester profile has been updated",
    // });

    toast.success('Profile saved successfully"');

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              required
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tester" className="text-right">
              Tester
            </Label>
            <Input
              id="tester"
              value={tester}
              onChange={(e) => setTester(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="institution" className="text-right">
              Institution
            </Label>
            <Input
              id="institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="faculty" className="text-right">
              Faculty
            </Label>
            <Input
              id="faculty"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">
              Department
            </Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="speciality" className="text-right">
              Speciality
            </Label>
            <Input
              id="speciality"
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DialogSign;

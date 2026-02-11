import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useCreateUser } from "@/hooks/use-users";
import { Loader2, Plus } from "lucide-react";

const formSchema = insertUserSchema.extend({
  email: z.string().email().optional().or(z.literal("")),
  courseName: z.string().optional().or(z.literal("")),
  duration: z.string().optional().or(z.literal("")),
  frequency: z.number().optional().or(z.literal("")),
  daysOfWeek: z.string().optional().or(z.literal("")),
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function UserDialog() {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const createUser = useCreateUser();
  
  const form = useForm<InsertUser>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      category: "student",
      email: "",
      courseName: "",
      duration: "",
      frequency: undefined,
      daysOfWeek: "",
    },
  });

  const toggleDay = (day: string) => {
    setSelectedDays(prev => {
      const newDays = prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day];
      form.setValue("daysOfWeek", newDays.join(","));
      return newDays;
    });
  };

  const onSubmit = (data: InsertUser) => {
    const userData = {
      ...data,
      email: data.email && data.email.trim() !== "" ? data.email : undefined,
      courseName: data.courseName && data.courseName.trim() !== "" ? data.courseName : undefined,
      duration: data.duration && data.duration.trim() !== "" ? data.duration : undefined,
      frequency: data.frequency || undefined,
      daysOfWeek: selectedDays.length > 0 ? selectedDays.join(",") : undefined,
    };
    
    createUser.mutate(userData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setSelectedDays([]);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" {...form.register("fullName")} placeholder="John Doe" />
            {form.formState.errors.fullName && (
              <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              onValueChange={(val) => form.setValue("category", val)}
              defaultValue={form.getValues("category")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input id="email" {...form.register("email")} placeholder="john@example.com" />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name (Optional)</Label>
            <Input id="courseName" {...form.register("courseName")} placeholder="Web Development" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Optional)</Label>
            <Input id="duration" {...form.register("duration")} placeholder="e.g., 3 months, 12 weeks" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency (Times per week)</Label>
            <Input 
              id="frequency" 
              type="number" 
              min="1" 
              max="7"
              {...form.register("frequency", { valueAsNumber: true })} 
              placeholder="e.g., 2, 3, 4" 
            />
          </div>

          <div className="space-y-2">
            <Label>Days of the Week</Label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox 
                    id={day}
                    checked={selectedDays.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  <label htmlFor={day} className="text-sm cursor-pointer">{day}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={createUser.isPending} className="w-full">
              {createUser.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

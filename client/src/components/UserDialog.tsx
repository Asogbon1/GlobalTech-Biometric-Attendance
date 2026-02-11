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
  courseName: z.string().min(1, "Course is required"),
  duration: z.string().min(1, "Duration is required"),
  frequency: z.number().min(1, "Frequency is required"),
  daysOfWeek: z.string().min(1, "Please select at least one day"),
});

const COURSES = [
  "Web Development",
  "Data Analytics",
  "Mobile App Development",
  "UI/UX Design",
  "Cybersecurity",
  "Cloud Computing",
  "Machine Learning",
  "Digital Marketing",
  "Software Engineering",
  "Database Administration",
];

const DURATIONS = Array.from({ length: 24 }, (_, i) => ({
  value: `${i + 1} month${i === 0 ? '' : 's'}`,
  label: `${i + 1} Month${i === 0 ? '' : 's'}`,
}));

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
      frequency: 2,
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
      daysOfWeek: selectedDays.join(","),
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
            <Label htmlFor="courseName">Course Name *</Label>
            <Select 
              onValueChange={(val) => form.setValue("courseName", val)}
              value={form.watch("courseName")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {COURSES.map((course) => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.courseName && (
              <p className="text-xs text-destructive">{form.formState.errors.courseName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration *</Label>
            <Select 
              onValueChange={(val) => form.setValue("duration", val)}
              value={form.watch("duration")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {DURATIONS.map((dur) => (
                  <SelectItem key={dur.value} value={dur.value}>{dur.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.duration && (
              <p className="text-xs text-destructive">{form.formState.errors.duration.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency (Times per week) *</Label>
            <Select 
              onValueChange={(val) => form.setValue("frequency", parseInt(val))}
              value={form.watch("frequency")?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'time' : 'times'} per week
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.frequency && (
              <p className="text-xs text-destructive">{form.formState.errors.frequency.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Days of the Week *</Label>
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

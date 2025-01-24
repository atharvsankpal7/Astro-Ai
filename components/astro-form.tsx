"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.date(),
  timeOfBirth: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  birthLocation: z.string().min(2, "Location must be at least 2 characters"),
});

type FormData = z.infer<typeof formSchema>;

const formSteps = [
  {
    id: "personal",
    title: "Personal Details",
    fields: ["name", "gender"],
  },
  {
    id: "birth",
    title: "Birth Details",
    fields: ["dateOfBirth", "timeOfBirth", "birthLocation"],
  },
];

export function AstroForm() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "male",
      timeOfBirth: "",
      birthLocation: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      // Here you would integrate with ProKerala API
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store the data and redirect to chat
      router.push("/chat");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentStep = formSteps[step];

  return (
    <div className="w-full max-w-xl mx-auto bg-card p-8 rounded-lg shadow-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {currentStep.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {formSteps.length}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter your full name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    onValueChange={(value) =>
                      form.setValue("gender", value as "male" | "female" | "other")
                    }
                    defaultValue="male"
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.getValues("dateOfBirth") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.getValues("dateOfBirth") ? (
                          format(form.getValues("dateOfBirth"), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.getValues("dateOfBirth")}
                        onSelect={(date) => form.setValue("dateOfBirth", date!)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeOfBirth">Time of Birth (24-hour format)</Label>
                  <Input
                    id="timeOfBirth"
                    type="time"
                    {...form.register("timeOfBirth")}
                  />
                  {form.formState.errors.timeOfBirth && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.timeOfBirth.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthLocation">Birth Location</Label>
                  <Input
                    id="birthLocation"
                    {...form.register("birthLocation")}
                    placeholder="City, Country"
                  />
                  {form.formState.errors.birthLocation && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.birthLocation.message}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
              >
                Previous
              </Button>
            )}
            {step === formSteps.length - 1 ? (
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Your Reading
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="ml-auto"
              >
                Next
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
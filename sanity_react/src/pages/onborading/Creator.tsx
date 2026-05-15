import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ArrowRight, ArrowLeft, Instagram, Twitch, Youtube } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/lib/services";
import { handleApiError } from "@/lib/api-client";
import { toast } from "react-hot-toast";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LocationSelector } from "@/components/LocationSelector";
import { PhoneInput } from "@/components/PhoneInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";

// --- Validation Schemas ---

const creatorSchema = z.object({
    // Step 1: Identity
    username: z.string().min(3, "Username must be at least 3 characters"),
    platformId: z.string(),

    // Step 2: Personal
    firstName: z.string().min(2, "First name is required").regex(/^[a-zA-Z\s]*$/, "First name can only contain letters and spaces"),
    middleName: z.string().optional(),
    lastName: z.string().min(2, "Last name is required").regex(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces"),
    dateOfBirth: z.string().min(1, "Date of birth is required").refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 >= 18;
        }
        return age >= 18;
    }, "You must be at least 18 years old"),
    gender: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    state: z.string().optional(),
    city: z.string().optional(),
    languages: z.array(z.string()).min(1, "Select at least one language"),
    // email removed
    phoneNumber: z.string().min(10, "Phone number is required"),

    // Step 3: Creator Profile
    bio: z.string().min(10, "Bio is too short"),
    niche: z.string().optional(),
    teamOrOrg: z.string().optional(),
    equipments: z.string().optional(),
    yearsOfExperience: z.string().optional(),

    // Step 4: Platforms
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
    twitch: z.string().optional(),
    sampleWorkLinks: z.array(z.string()).optional(),

    // Step 5: Monetization
    monetizationPlatforms: z.string().optional(),

    // Step 6: Verification
    profilePic: z.string().optional(),
    bannerPic: z.string().optional(),
    termsAccepted: z.boolean().refine(val => val === true, "Must accept terms"),
});

type CreatorFormData = z.infer<typeof creatorSchema>;

const STEPS = ['identity', 'personal', 'profile', 'platforms', 'monetization', 'verification'];

const LANGUAGES = ["English", "Hindi", "Spanish", "French"];

export default function CreatorOnboarding() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const currentStepId = searchParams.get("step") || STEPS[0];
    const currentStep = STEPS.indexOf(currentStepId);
    const safeCurrentStep = currentStep === -1 ? 0 : currentStep;

    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreatorFormData>({
        resolver: zodResolver(creatorSchema) as any,
        defaultValues: {
            platformId: `PID-${Math.floor(Math.random() * 100000)}`,
            languages: [],
            sampleWorkLinks: [],
            username: user?.username || "",
            // email removed
            phoneNumber: "",
            country: "",
            state: "",
            city: ""
        },
        mode: "onChange"
    });

    const { register, handleSubmit, formState: { errors }, trigger, watch, setValue, getValues } = form;

    // Auto-fill
    useEffect(() => {
        if (user) {
            const currentValues = getValues();
            if (!currentValues.username && user.username) setValue('username', user.username, { shouldDirty: false });
            // email autofill removed
            if (!currentValues.platformId && user.id) setValue('platformId', `PID-${user.id.substring(0, 6).toUpperCase()}`, { shouldDirty: false });
        }
    }, [user, setValue, getValues]);

    const watchUsername = watch("username");
    const watchLanguages = watch("languages");

    const checkUsername = async () => {
        if (!watchUsername || watchUsername.length < 3) return;
        if (user && watchUsername === user.username) {
            setUsernameAvailable(true);
            return;
        }
        setTimeout(() => {
            const isTaken = watchUsername.toLowerCase() === "admin";
            setUsernameAvailable(!isTaken);
        }, 500);
    };

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        switch (safeCurrentStep) {
            case 0: fieldsToValidate = ['username']; break;
            case 1: fieldsToValidate = ['firstName', 'lastName', 'dateOfBirth', 'country', 'phoneNumber', 'languages']; break;
            case 2: fieldsToValidate = ['bio']; break;
            case 3: fieldsToValidate = []; break;
            case 4: fieldsToValidate = []; break;
            case 5: fieldsToValidate = ['termsAccepted']; break;
        }

        const isStepValid = await trigger(fieldsToValidate as any);
        if (!isStepValid) return;

        if (safeCurrentStep < STEPS.length - 1) {
            const nextStepId = STEPS[safeCurrentStep + 1];
            setSearchParams({ step: nextStepId });
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        if (safeCurrentStep > 0) {
            const prevStepId = STEPS[safeCurrentStep - 1];
            setSearchParams({ step: prevStepId });
        }
    };

    const toggleLanguage = (lang: string) => {
        const current = watchLanguages || [];
        if (current.includes(lang)) {
            setValue('languages', current.filter(l => l !== lang));
        } else {
            setValue('languages', [...current, lang]);
        }
    };

    const onSubmit: SubmitHandler<CreatorFormData> = async (data) => {
        setIsSubmitting(true);
        try {
            console.log("Submitting Creator Data:", data);

            const formData = new FormData();
            
            // Add all form fields
            formData.append('type', 'creator');
            formData.append('platformId', data.platformId);
            formData.append('firstName', data.firstName);
            if (data.middleName) formData.append('middleName', data.middleName);
            formData.append('lastName', data.lastName);
            formData.append('dateOfBirth', data.dateOfBirth);
            if (data.gender) formData.append('gender', data.gender);
            formData.append('country', data.country);
            if (data.state) formData.append('state', data.state);
            if (data.city) formData.append('city', data.city);
            formData.append('phoneNumber', data.phoneNumber);
            if (data.instagram) formData.append('instagram', data.instagram);
            if (data.linkedin) formData.append('linkedin', data.linkedin);
            if (data.youtube) formData.append('youtube', data.youtube);
            if (data.twitch) formData.append('twitch', data.twitch);
            formData.append('languages', JSON.stringify(data.languages));
            if (data.teamOrOrg) formData.append('teamOrOrg', data.teamOrOrg);
            if (data.niche) formData.append('niche', data.niche);
            if (data.equipments) formData.append('equipments', data.equipments);
            if (data.yearsOfExperience) formData.append('yearsOfExperience', data.yearsOfExperience);
            formData.append('sampleWorkLinks', JSON.stringify(data.sampleWorkLinks || []));
            if (data.monetizationPlatforms) formData.append('monetizationPlatforms', data.monetizationPlatforms);
            formData.append('bio', data.bio);

            // Handle images - convert base64 to File objects
            if (data.profilePic && data.profilePic.startsWith('data:')) {
                const blob = await fetch(data.profilePic).then(r => r.blob());
                formData.append('profilePic', blob, 'profile.jpg');
            }
            
            if (data.bannerPic && data.bannerPic.startsWith('data:')) {
                const blob = await fetch(data.bannerPic).then(r => r.blob());
                formData.append('bannerPic', blob, 'banner.jpg');
            }

            await userService.updateProfile(formData);
            await refreshUser();

            toast.success("Creator Profile Created Successfully!");
            navigate('/dashboard');
        } catch (error) {
            toast.error(handleApiError(error) || "Failed to create profile");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* --- Step 1: Identity --- */}
            {safeCurrentStep === 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Creator Identity</h2>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Platform Username</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter username"
                                    {...register("username")}
                                    onBlur={checkUsername}
                                    className={usernameAvailable === true ? "border-green-500" : usernameAvailable === false ? "border-red-500" : ""}
                                />
                                {usernameAvailable === true && <Check className="text-green-500 mt-2" />}
                            </div>
                            {errors.username && <p className="text-destructive text-xs">{errors.username.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Platform ID</label>
                            <Input {...register("platformId")} disabled className="bg-muted text-muted-foreground" />
                        </div>
                    </div>
                </div>
            )}

            {/* --- Step 2: Personal --- */}
            {safeCurrentStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First Name *</label>
                            <Input placeholder="John" {...register("firstName")} />
                            {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Middle Name</label>
                            <Input placeholder="(Optional)" {...register("middleName")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name *</label>
                            <Input placeholder="Doe" {...register("lastName")} />
                            {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date of Birth *</label>
                            <Input 
                                type="date" 
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                {...register("dateOfBirth")} 
                            />
                            {errors.dateOfBirth && <p className="text-destructive text-xs">{errors.dateOfBirth.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Gender</label>
                            <Select onValueChange={(val) => setValue('gender', val)} defaultValue={watch('gender')}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Email field removed */}
                        <PhoneInput
                            value={watch('phoneNumber')}
                            onChange={(val) => setValue('phoneNumber', val, { shouldValidate: true })}
                            label="Phone Number"
                            error={errors.phoneNumber?.message}
                        />
                        <LocationSelector
                            countryValue={watch('country')}
                            cityValue={watch('city') ?? ''}
                            onCountryChange={(name) => { setValue('country', name); setValue('state', ''); setValue('city', ''); }}
                            onStateChange={(name) => { setValue('state', name); setValue('city', ''); }}
                            onCityChange={(name) => setValue('city', name)}
                            countryError={errors.country?.message}
                            stateRequired={false}
                            cityRequired={false}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content Languages *</label>
                        <div className="flex flex-wrap gap-2">
                            {LANGUAGES.map(lang => (
                                <div
                                    key={lang}
                                    onClick={() => toggleLanguage(lang)}
                                    className={`cursor-pointer border rounded-full px-3 py-1 text-sm ${watchLanguages?.includes(lang) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                                >
                                    {lang}
                                </div>
                            ))}
                        </div>
                        {errors.languages && <p className="text-destructive text-xs">{errors.languages.message}</p>}
                    </div>
                </div>
            )}

            {/* --- Step 3: Creator Profile --- */}
            {safeCurrentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Creator Profile</h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bio *</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe your content style..."
                                {...register("bio")}
                            />
                            {errors.bio && <p className="text-destructive text-xs">{errors.bio.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Niche</label>
                            <Input placeholder="Gaming, Tech Reviews, etc." {...register("niche")} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Team or Organization</label>
                            <Input placeholder="Your team name (if any)" {...register("teamOrOrg")} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Equipment</label>
                            <Input placeholder="Camera, Mic, etc." {...register("equipments")} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Years of Experience</label>
                            <Input placeholder="e.g. 3" {...register("yearsOfExperience")} />
                        </div>
                    </div>
                </div>
            )}

            {/* --- Step 4: Social Platforms --- */}
            {safeCurrentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Social Platforms</h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Instagram</label>
                            <div className="flex gap-2 items-center">
                                <Instagram className="h-4 w-4 text-muted-foreground" />
                                <Input placeholder="@username" {...register("instagram")} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">LinkedIn</label>
                            <Input placeholder="linkedin.com/in/username" {...register("linkedin")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">YouTube</label>
                            <div className="flex gap-2 items-center">
                                <Youtube className="h-4 w-4 text-muted-foreground" />
                                <Input placeholder="youtube.com/@channel" {...register("youtube")} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Twitch</label>
                            <div className="flex gap-2 items-center">
                                <Twitch className="h-4 w-4 text-muted-foreground" />
                                <Input placeholder="twitch.tv/username" {...register("twitch")} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Step 5: Monetization --- */}
            {safeCurrentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Monetization & Media</h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Monetization Platforms</label>
                            <Input placeholder="e.g. Patreon, YouTube Memberships" {...register("monetizationPlatforms")} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Profile Picture URL</label>
                            <Input placeholder="https://..." {...register("profilePic")} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Banner Picture URL</label>
                            <Input placeholder="https://..." {...register("bannerPic")} />
                        </div>
                    </div>
                </div>
            )}

            {/* --- Step 6: Verification --- */}
            {safeCurrentStep === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Final Step</h2>

                    <div className="space-y-4">
                        <div className="border bg-muted/20 p-4 rounded-lg space-y-4">
                            <h3 className="font-medium">Creator Agreement</h3>
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={watch('termsAccepted')}
                                    onChange={(e) => setValue('termsAccepted', e.target.checked)}
                                />
                                <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-0.5">
                                    I accept the <span className="text-primary underline">Creator Terms</span>.
                                </label>
                            </div>
                            {errors.termsAccepted && <p className="text-destructive text-xs">{errors.termsAccepted.message}</p>}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-6 border-t mt-8">
                <Button type="button" variant="outline" onClick={prevStep} disabled={safeCurrentStep === 0}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>

                {safeCurrentStep === STEPS.length - 1 ? (
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                        {isSubmitting ? 'Submit Profile' : 'Submitting...'} <Check className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button type="button" onClick={nextStep}>
                        Next Step <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                )}
            </div>
        </form>
    );
}
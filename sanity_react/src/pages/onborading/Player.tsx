import { useRef, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ArrowRight, ArrowLeft, Plus, Trash2, Camera, ImageIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/lib/services";
import { handleApiError } from "@/lib/api-client";
import { getImageUrl } from "@/lib/utils";
import { toast } from "react-hot-toast";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LocationSelector } from "@/components/LocationSelector";
import { PhoneInput } from "@/components/PhoneInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { ImageCropper } from "@/components/ImageCropper";

// --- Validation Schemas ---
const gameProfileSchema = z.object({
    game: z.string().min(1, "Select a game"),
    ign: z.string().min(1, "IGN is required"),
    gameId: z.string().min(1, "Game ID is required"),
    rank: z.string().optional(),
    statsUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const playerSchema = z.object({
    // Step 1: Identity
    username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscore"),
    platformId: z.string(),

    // Step 2: Personal
    firstName: z.string().min(2, "First name is required").regex(/^[a-zA-Z\s]*$/, "First name can only contain letters and spaces"),
    middleName: z.string().optional(),
    lastName: z.string().min(2, "Last name is required").regex(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces"),
    dateofBirth: z.string().min(1, "Date of birth is required").refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 >= 18;
        }
        return age >= 18;
    }, "You must be at least 18 years old"),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),

    // Step 3: Contact
    PhoneNumber: z.string().min(10, "Invalid phone number"),

    // Step 4: Institution
    institution: z.string().optional(),

    // Step 5: Game Profiles
    gameProfiles: z.array(gameProfileSchema).min(1, "Add at least one game profile"),

    // Step 6: Other
    preferredRole: z.string().optional(),
    profilePic: z.string().optional(),
    banner: z.string().optional(),
    termsAccepted: z.boolean().refine(val => val === true, "Must accept terms"),
});

type PlayerFormData = z.infer<typeof playerSchema>;

const STEPS = ['identity', 'personal', 'contact', 'institution', 'games', 'other'];

const POPULAR_INSTITUTES = [
    "Indian Institute of Technology (IIT)",
    "National Institute of Technology (NIT)",
    "Delhi University",
    "Mumbai University",
    "Bangalore University",
    "Anna University",
    "VIT University",
    "BITS Pilani",
    "Chandigarh University",
    "Manipal University",
    "Other"
];

export default function PlayerOnboarding() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const currentStepId = searchParams.get("step") || STEPS[0];
    const currentStep = STEPS.indexOf(currentStepId);
    const safeCurrentStep = currentStep === -1 ? 0 : currentStep;

    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [institutionOther, setInstitutionOther] = useState(false);
    const profilePicInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [cropperImage, setCropperImage] = useState<string | null>(null);
    const [cropperMode, setCropperMode] = useState<'profile' | 'banner' | null>(null);

    const form = useForm<PlayerFormData>({
        resolver: zodResolver(playerSchema) as any,
        defaultValues: {
            username: user?.username || "",
            PhoneNumber: "",
            platformId: user?.id ? `PID-${user.id.substring(0, 6).toUpperCase()}` : `PID-${Math.floor(Math.random() * 100000)}`,
            gameProfiles: [{ game: "", ign: "", gameId: "", rank: "" }],
            country: "",
            state: "",
            city: ""
        },
        mode: "onChange"
    });

    const { register, control, handleSubmit, formState: { errors }, trigger, watch, setValue, getValues } = form;

    // Auto-fill form if user data loads late
    useEffect(() => {
        if (user) {
            const currentValues = getValues();
            if (!currentValues.username && user.username) setValue('username', user.username, { shouldDirty: false });
            if (!currentValues.platformId && user.id) setValue('platformId', `PID-${user.id.substring(0, 6).toUpperCase()}`, { shouldDirty: false });
            
            // Load existing profile and banner images if they exist
            if ((user as any)?.profilePic && !profilePicPreview) {
                const profilePicUrl = getImageUrl((user as any).profilePic);
                if (profilePicUrl) {
                    setProfilePicPreview(profilePicUrl);
                    setValue('profilePic', profilePicUrl, { shouldDirty: false });
                }
            }
            if ((user as any)?.banner && !bannerPreview) {
                const bannerUrl = getImageUrl((user as any).banner);
                if (bannerUrl) {
                    setBannerPreview(bannerUrl);
                }
                setValue('banner', bannerUrl, { shouldDirty: false });
            }
        }
    }, [user, setValue, getValues]);

    const { fields: gameFields, append: appendGame, remove: removeGame } = useFieldArray({
        control,
        name: "gameProfiles"
    });

    const watchUsername = watch("username");

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
            case 1: fieldsToValidate = ['firstName', 'lastName', 'dateofBirth', 'country', 'state', 'city']; break;
            case 2: fieldsToValidate = ['PhoneNumber']; break;
            case 3: fieldsToValidate = []; break;
            case 4: fieldsToValidate = ['gameProfiles']; break;
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

    const onSubmit: SubmitHandler<PlayerFormData> = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            
            // Add all form fields
            formData.append('type', 'player');
            formData.append('username', data.username);
            formData.append('firstName', data.firstName);
            if (data.middleName) formData.append('middleName', data.middleName);
            formData.append('lastName', data.lastName);
            formData.append('PhoneNumber', data.PhoneNumber);
            formData.append('dateofBirth', data.dateofBirth);
            formData.append('country', data.country);
            formData.append('state', data.state);
            formData.append('city', data.city);
            if (data.institution) formData.append('institution', data.institution);
            formData.append('gameProfiles', JSON.stringify(data.gameProfiles));
            if (data.preferredRole) formData.append('preferredRole', data.preferredRole);

            // Handle images - convert base64 to File objects
            if (data.profilePic && data.profilePic.startsWith('data:')) {
                const blob = await fetch(data.profilePic).then(r => r.blob());
                formData.append('profilePic', blob, 'profile.jpg');
            }
            
            if (data.banner && data.banner.startsWith('data:')) {
                const blob = await fetch(data.banner).then(r => r.blob());
                formData.append('bannerPic', blob, 'banner.jpg');
            }

            await userService.updateProfile(formData);
            await refreshUser();

            toast.success("Player Profile Created Successfully!");
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
                    <h2 className="text-xl font-semibold">Player Identity</h2>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
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
                            <label className="text-sm font-medium">Middle Name (Optional)</label>
                            <Input placeholder="M." {...register("middleName")} />
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
                                {...register("dateofBirth")} 
                            />
                            {errors.dateofBirth && <p className="text-destructive text-xs">{errors.dateofBirth.message}</p>}
                        </div>
                        <LocationSelector
                            countryValue={watch('country')}
                            cityValue={watch('city')}
                            onCountryChange={(name) => { setValue('country', name); setValue('state', ''); setValue('city', ''); }}
                            onStateChange={(name) => { setValue('state', name); setValue('city', ''); }}
                            onCityChange={(name) => setValue('city', name)}
                            countryError={errors.country?.message}
                            stateError={errors.state?.message}
                            cityError={errors.city?.message}
                        />
                    </div>
                </div>
            )}

            {/* --- Step 3: Contact --- */}
            {safeCurrentStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Contact Details</h2>
                    <div className="space-y-4">
                        <PhoneInput
                            value={watch('PhoneNumber')}
                            onChange={(val) => setValue('PhoneNumber', val, { shouldValidate: true })}
                            label="Phone Number"
                            error={errors.PhoneNumber?.message}
                        />
                    </div>
                </div>
            )}

            {/* --- Step 4: Institution --- */}
            {safeCurrentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Institution</h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">School / College / Organization</label>
                            <Select 
                                onValueChange={(val) => {
                                    if (val === "Other") {
                                        setInstitutionOther(true);
                                        setValue('institution', '');
                                    } else {
                                        setInstitutionOther(false);
                                        setValue('institution', val);
                                    }
                                }} 
                                defaultValue={watch('institution') === 'Other' ? 'Other' : watch('institution') || ''}
                            >
                                <SelectTrigger><SelectValue placeholder="Select your institution" /></SelectTrigger>
                                <SelectContent>
                                    {POPULAR_INSTITUTES.map((institute) => (
                                        <SelectItem key={institute} value={institute}>{institute}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {institutionOther && (
                                <Input 
                                    placeholder="Enter your institution name" 
                                    {...register("institution")}
                                    className="mt-3"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- Step 5: Game Profiles --- */}
            {safeCurrentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Game Profiles</h2>
                        <Button type="button" variant="secondary" size="sm" onClick={() => appendGame({ game: "", ign: "", gameId: "", rank: "" })}>
                            <Plus className="h-4 w-4 mr-2" /> Add Game
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {gameFields.map((field, index) => (
                            <div key={field.id} className="border p-4 rounded-lg space-y-4 relative bg-card">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => removeGame(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Select Game</label>
                                    <Select onValueChange={(val) => setValue(`gameProfiles.${index}.game`, val)} defaultValue={field.game}>
                                        <SelectTrigger><SelectValue placeholder="Select Game" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="valorant">Valorant</SelectItem>
                                            <SelectItem value="cs2">CS2</SelectItem>
                                            <SelectItem value="bgmi">BGMI</SelectItem>
                                            <SelectItem value="pokemon">Pokemon Unite</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gameProfiles?.[index]?.game && <p className="text-destructive text-xs">{errors.gameProfiles?.[index]?.game?.message}</p>}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">In-Game Name (IGN)</label>
                                        <Input placeholder="ProPlayer#123" {...register(`gameProfiles.${index}.ign`)} />
                                        {errors.gameProfiles?.[index]?.ign && <p className="text-destructive text-xs">{errors.gameProfiles?.[index]?.ign?.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Game ID / UID</label>
                                        <Input placeholder="123456789" {...register(`gameProfiles.${index}.gameId`)} />
                                        {errors.gameProfiles?.[index]?.gameId && <p className="text-destructive text-xs">{errors.gameProfiles?.[index]?.gameId?.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Current Rank</label>
                                        <Input placeholder="Diamond 1" {...register(`gameProfiles.${index}.rank`)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Stats URL (Tracker.gg)</label>
                                        <Input placeholder="https://tracker.gg/..." {...register(`gameProfiles.${index}.statsUrl`)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {errors.gameProfiles && <p className="text-destructive text-sm bg-destructive/10 p-2 rounded">{errors.gameProfiles.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Preferred Role</label>
                        <Input placeholder="e.g. IGL, Fragger, Support" {...register("preferredRole")} />
                    </div>
                </div>
            )}

            {/* --- Step 6: Other / Final --- */}
            {safeCurrentStep === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Profile & Final Steps</h2>

                    <div className="space-y-6">
                        {/* Banner + Profile Pic (LinkedIn-style) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Profile Photos</label>
                            <div className="relative rounded-xl overflow-hidden border border-white/10">
                                {/* Banner */}
                                <div
                                    className="h-36 w-full bg-gradient-to-r from-[#1f1a2e] to-[#2d1b69] flex items-center justify-center cursor-pointer group relative"
                                    onClick={() => bannerInputRef.current?.click()}
                                >
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400 group-hover:text-purple-400 transition-colors">
                                            <ImageIcon className="h-8 w-8 mb-1" />
                                            <span className="text-xs">Click to upload banner</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                {/* Profile Pic circle */}
                                <div className="absolute left-4 bottom-0 translate-y-1/2">
                                    <div
                                        className="w-20 h-20 rounded-full border-4 border-[#1a1625] bg-[#2d1b69] flex items-center justify-center cursor-pointer group overflow-hidden relative"
                                        onClick={() => profilePicInputRef.current?.click()}
                                    >
                                        {profilePicPreview ? (
                                            <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="h-6 w-6 text-gray-400 group-hover:text-purple-400 transition-colors" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                                            <Camera className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-12 flex gap-4 text-xs text-gray-500">
                                <span>Profile photo: circular (JPG/PNG, max 5MB)</span>
                                <span>·</span>
                                <span>Banner: wide image (JPG/PNG, max 10MB)</span>
                            </div>
                            {/* Hidden file inputs */}
                            <input
                                ref={profilePicInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        const result = ev.target?.result as string;
                                        setCropperImage(result);
                                        setCropperMode('profile');
                                    };
                                    reader.readAsDataURL(file);
                                }}
                            />
                            <input
                                ref={bannerInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        const result = ev.target?.result as string;
                                        setCropperImage(result);
                                        setCropperMode('banner');
                                    };
                                    reader.readAsDataURL(file);
                                }}
                            />
                        </div>

                        <div className="border bg-muted/20 p-4 rounded-lg space-y-4">
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={watch('termsAccepted')}
                                    onChange={(e) => setValue('termsAccepted', e.target.checked)}
                                />
                                <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-0.5">
                                    I accept the <span className="text-primary underline">Terms & Conditions</span> and <span className="text-primary underline">Privacy Policy</span>.
                                </label>
                            </div>
                            {errors.termsAccepted && <p className="text-destructive text-xs">{errors.termsAccepted.message}</p>}
                        </div>
                    </div>
                </div>
            )}

            {cropperImage && (
                <ImageCropper
                    imageSrc={cropperImage}
                    isCircular={cropperMode === 'profile'}
                    onCropComplete={(croppedImage) => {
                        if (cropperMode === 'profile') {
                            setProfilePicPreview(croppedImage);
                            setValue('profilePic', croppedImage);
                        } else if (cropperMode === 'banner') {
                            setBannerPreview(croppedImage);
                            setValue('banner', croppedImage);
                        }
                        setCropperImage(null);
                        setCropperMode(null);
                    }}
                    onCancel={() => {
                        setCropperImage(null);
                        setCropperMode(null);
                    }}
                />
            )}

            <div className="flex justify-between pt-6 border-t mt-8">
                <Button type="button" variant="outline" onClick={prevStep} disabled={safeCurrentStep === 0}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>

                {safeCurrentStep === STEPS.length - 1 ? (
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Complete Profile'} <Check className="h-4 w-4 ml-2" />
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

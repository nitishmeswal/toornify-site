import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
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
const organiserSchema = z.object({
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
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    // email removed
    phone: z.string().min(10, "Phone is required"),

    // Step 3: Organiser Details
    organiserType: z.enum(["individual", "organization", "cafe", "club"]),
    organisationName: z.string().optional(),
    locationCity: z.string().min(1, "Organization city is required"),
    locationState: z.string().min(1, "Organization state is required"),
    locationCountry: z.string().min(1, "Organization country is required"),

    // Step 4: Games
    gameTitles: z.array(z.string()).min(1, "Select at least one game"),
    requestedGame: z.string().optional(),

    // Step 5: Branding
    logo: z.string().optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    instagramHandle: z.string().optional(),
    discordServer: z.string().optional(),
    youtubeChannel: z.string().optional(),

    // Step 6: Verification
    govtId: z.string().optional(),
    panId: z.string().optional(),
    upiId: z.string().optional(),
    bankAccount: z.string().optional(),
    bankIfsc: z.string().optional(),
    bankName: z.string().optional(),
    gstNumber: z.string().optional(),
    termsAccepted: z.boolean().refine(val => val === true, "Must accept terms"),
}).refine((data) => {
    if (data.organiserType !== 'individual' && !data.organisationName) return false;
    return true;
}, {
    message: "Organization Name is required",
    path: ["organisationName"]
});

type OrganiserFormData = z.infer<typeof organiserSchema>;

const STEPS = ['identity', 'personal', 'details', 'games', 'branding', 'verification'];

const AVAILABLE_GAMES = [
    { id: 'valorant', label: 'Valorant' },
    { id: 'csgo', label: 'CS:GO' },
    { id: 'lol', label: 'League of Legends' },
    { id: 'bgmi', label: 'BGMI' },
    { id: 'cod', label: 'Call of Duty' },
    { id: 'fifa', label: 'FIFA 24' },
];

export default function OrganiserOnboarding() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const currentStepId = searchParams.get("step") || STEPS[0];
    const currentStep = STEPS.indexOf(currentStepId);
    const safeCurrentStep = currentStep === -1 ? 0 : currentStep;

    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<OrganiserFormData>({
        resolver: zodResolver(organiserSchema),
        defaultValues: {
            platformId: `PID-${Math.floor(Math.random() * 100000)}`,
            organiserType: "individual",
            gameTitles: [],
            organisationName: "",
            username: user?.username || "",
            // email removed
            country: "",
            state: "",
            city: "",
            locationCountry: "India"
        },
        mode: "onChange"
    });

    const { register, handleSubmit, formState: { errors }, trigger, watch, setValue, getValues } = form;

    // Auto-fill
    useEffect(() => {
        if (user) {
            const currentValues = getValues();
            if (!currentValues.username && user.username) setValue('username', user.username, { shouldDirty: false });
            if (!currentValues.platformId && user.id) setValue('platformId', `PID-${user.id.substring(0, 6).toUpperCase()}`, { shouldDirty: false });
        }
    }, [user, setValue, getValues]);

    const watchGameTitles = watch("gameTitles");
    const watchOrganiserType = watch("organiserType");
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
            case 1: fieldsToValidate = ['firstName', 'lastName', 'dateOfBirth', 'country', 'state', 'city', 'phone']; break;
            case 2: fieldsToValidate = ['organiserType', 'locationCity', 'locationState', 'locationCountry']; break;
            case 3: fieldsToValidate = ['gameTitles']; break;
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

    const toggleGame = (gameId: string) => {
        const current = watchGameTitles || [];
        if (current.includes(gameId)) {
            setValue('gameTitles', current.filter(g => g !== gameId));
        } else {
            setValue('gameTitles', [...current, gameId]);
        }
    };

    const onSubmit = async (data: OrganiserFormData) => {
        setIsSubmitting(true);
        try {
            console.log("Submitting Organiser Data:", data);

            const formData = new FormData();
            
            // Add all form fields
            formData.append('type', 'organiser');
            formData.append('firstName', data.firstName);
            if (data.middleName) formData.append('middleName', data.middleName);
            formData.append('lastName', data.lastName);
            formData.append('dateOfBirth', data.dateOfBirth);
            formData.append('country', data.country);
            formData.append('state', data.state);
            formData.append('city', data.city);
            formData.append('phone', data.phone);
            if (data.instagram) formData.append('instagram', data.instagram);
            if (data.linkedin) formData.append('linkedin', data.linkedin);
            formData.append('organiserType', data.organiserType);
            if (data.organisationName) formData.append('organisationName', data.organisationName);
            formData.append('locationCity', data.locationCity);
            formData.append('locationState', data.locationState);
            formData.append('locationCountry', data.locationCountry || "India");
            formData.append('gameTitles', JSON.stringify(data.gameTitles));
            if (data.requestedGame) formData.append('requestedGame', data.requestedGame);
            if (data.website) formData.append('website', data.website);
            if (data.instagramHandle) formData.append('instagramHandle', data.instagramHandle);
            if (data.discordServer) formData.append('discordServer', data.discordServer);
            if (data.youtubeChannel) formData.append('youtubeChannel', data.youtubeChannel);
            if (data.govtId) formData.append('govtId', data.govtId);
            if (data.panId) formData.append('panId', data.panId);
            if (data.upiId) formData.append('upiId', data.upiId);
            if (data.bankAccount) formData.append('bankAccount', data.bankAccount);
            if (data.bankIfsc) formData.append('bankIfsc', data.bankIfsc);
            if (data.bankName) formData.append('bankName', data.bankName);
            if (data.gstNumber) formData.append('gstNumber', data.gstNumber);

            // Handle logo - convert base64 to File object
            if (data.logo && data.logo.startsWith('data:')) {
                const blob = await fetch(data.logo).then(r => r.blob());
                formData.append('logo', blob, 'logo.jpg');
            }

            await userService.updateProfile(formData);
            await refreshUser();

            toast.success("Organiser Profile Created Successfully!");
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
                    <h2 className="text-xl font-semibold">Organiser Identity</h2>
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
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First Name *</label>
                            <Input placeholder="John" {...register("firstName")} />
                            {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Middle Name</label>
                            <Input placeholder="D." {...register("middleName")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name *</label>
                            <Input placeholder="Doe" {...register("lastName")} />
                            {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
                        </div>
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

                    <PhoneInput
                        value={watch('phone')}
                        onChange={(val) => setValue('phone', val, { shouldValidate: true })}
                        label="Phone"
                        error={errors.phone?.message}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
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

            {/* --- Step 3: Organiser Details --- */}
            {safeCurrentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Organization Details</h2>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Organizer Type *</label>
                            <Select onValueChange={(val) => setValue('organiserType', val as any)} defaultValue={watchOrganiserType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="individual">Individual Organizer</SelectItem>
                                    <SelectItem value="organization">Esports Organization</SelectItem>
                                    <SelectItem value="cafe">Gaming Café</SelectItem>
                                    <SelectItem value="club">College/School Club</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {watchOrganiserType === 'individual' ? 'Display Name' : 'Organization Name'}
                            </label>
                            <Input placeholder="Enter name" {...register("organisationName")} className="flex-1" />
                            {errors.organisationName && <p className="text-destructive text-xs">{errors.organisationName.message}</p>}
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <LocationSelector
                                countryValue={watch('locationCountry')}
                                cityValue={watch('locationCity')}
                                onCountryChange={(name) => { setValue('locationCountry', name); setValue('locationState', ''); setValue('locationCity', ''); }}
                                onStateChange={(name) => { setValue('locationState', name); setValue('locationCity', ''); }}
                                onCityChange={(name) => setValue('locationCity', name)}
                                countryLabel="Organization Country"
                                stateLabel="Organization State"
                                cityLabel="Organization City"
                                countryError={errors.locationCountry?.message}
                                stateError={errors.locationState?.message}
                                cityError={errors.locationCity?.message}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- Step 4: Games --- */}
            {safeCurrentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Games You Organize</h2>
                    <p className="text-sm text-muted-foreground">Select all the games you plan to host tournaments for.</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {AVAILABLE_GAMES.map(game => {
                            const isSelected = watchGameTitles.includes(game.id);
                            return (
                                <div
                                    key={game.id}
                                    onClick={() => toggleGame(game.id)}
                                    className={`cursor-pointer border rounded-lg p-4 transition-all ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                >
                                    <div className="flex items-center justify-between pointer-events-none">
                                        <span className="font-medium">{game.label}</span>
                                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {errors.gameTitles && <p className="text-destructive text-xs">{errors.gameTitles.message}</p>}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Requested Game (if not in list)</label>
                        <Input placeholder="Enter game name" {...register("requestedGame")} />
                    </div>
                </div>
            )}

            {/* --- Step 5: Branding --- */}
            {safeCurrentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Branding & Social</h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Logo URL</label>
                            <Input placeholder="https://..." {...register("logo")} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Website</label>
                            <Input placeholder="https://your-org.com" {...register("website")} />
                            {errors.website && <p className="text-destructive text-xs">{errors.website.message}</p>}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Instagram</label>
                                <Input placeholder="@handle" {...register("instagram")} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">LinkedIn</label>
                                <Input placeholder="linkedin.com/company/..." {...register("linkedin")} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Instagram Handle</label>
                                <Input placeholder="@orghandle" {...register("instagramHandle")} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Discord Server</label>
                                <Input placeholder="discord.gg/invite" {...register("discordServer")} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">YouTube Channel</label>
                                <Input placeholder="youtube.com/@channel" {...register("youtubeChannel")} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Step 6: Verification --- */}
            {safeCurrentStep === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold">Verification & Banking</h2>

                    <div className="space-y-4">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg space-y-4">
                            <h3 className="font-medium text-yellow-500 mb-1">Identity & Tax Information</h3>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Government ID URL</label>
                                    <Input placeholder="https://..." {...register("govtId")} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">PAN ID</label>
                                    <Input placeholder="ABCDE1234F" {...register("panId")} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">GST Number (Optional)</label>
                                    <Input placeholder="GSTIN" {...register("gstNumber")} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">UPI ID</label>
                                    <Input placeholder="user@upi" {...register("upiId")} />
                                </div>
                            </div>
                        </div>

                        <div className="border bg-muted/20 p-4 rounded-lg space-y-4">
                            <h3 className="font-medium">Bank Details (for withdrawals)</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Account Number</label>
                                    <Input placeholder="xxxxxxxxxxxx" {...register("bankAccount")} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">IFSC Code</label>
                                    <Input placeholder="ABCD0123456" {...register("bankIfsc")} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Bank Name</label>
                                    <Input placeholder="State Bank of India" {...register("bankName")} />
                                </div>
                            </div>
                        </div>

                        <div className="border bg-muted/20 p-4 rounded-lg space-y-4">
                            <h3 className="font-medium">Organizer Agreement</h3>
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={watch('termsAccepted')}
                                    onChange={(e) => setValue('termsAccepted', e.target.checked)}
                                />
                                <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-0.5">
                                    I agree to the <span className="text-primary underline">Organizer Rules</span> and fees structure.
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
                        {isSubmitting ? 'Submit Application' : 'Submit Application'} <Check className="h-4 w-4 ml-2" />
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
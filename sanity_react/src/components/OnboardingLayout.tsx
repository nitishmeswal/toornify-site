import { useEffect } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    User,
    Gamepad2,
    FileText,
    CheckCircle,
    Building2,
    Tv,
    Briefcase
} from "lucide-react";
import { Button } from "./ui/Button";
import { useAuth } from "@/context/AuthContext";

// Define the steps structure for each onboarding flow
const onboardingSteps = {
    player: [
        { id: 'identity', title: 'Identity', icon: User, description: 'Username & ID' },
        { id: 'personal', title: 'Personal Info', icon: FileText, description: 'Basic details' },
        { id: 'contact', title: 'Contact', icon: Briefcase, description: 'Email, Phone & Socials' },
        { id: 'education', title: 'Education', icon: Building2, description: 'Academic & Org' },
        { id: 'games', title: 'Game Profiles', icon: Gamepad2, description: 'Your esports portfolio' },
        { id: 'other', title: 'Other Details', icon: CheckCircle, description: 'Role & Review' },
    ],
    organiser: [
        { id: 'identity', title: 'Identity', icon: User, description: 'Username & ID' },
        { id: 'personal', title: 'Personal Info', icon: FileText, description: 'Basic details' },
        { id: 'details', title: 'Organiser Details', icon: Building2, description: 'Type & Location' },
        { id: 'games', title: 'Games', icon: Gamepad2, description: 'Games you host' },
        { id: 'branding', title: 'Branding', icon: Tv, description: 'Logo & Assets' },
        { id: 'verification', title: 'Verification', icon: CheckCircle, description: 'KYC & Payout' },
    ],
    creator: [
        { id: 'identity', title: 'Identity', icon: User, description: 'Username & ID' },
        { id: 'personal', title: 'Personal Info', icon: FileText, description: 'Basic details' },
        { id: 'profile', title: 'Creator Profile', icon: User, description: 'Bio, Tags & Style' },
        { id: 'platforms', title: 'Platforms', icon: Tv, description: 'Social Channels' },
        { id: 'monetization', title: 'Monetization', icon: Briefcase, description: 'Rates & Budget' },
        { id: 'verification', title: 'Verification', icon: CheckCircle, description: 'KYC & Payout' },
    ]
};

const OnboardingLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    // Protect the route
    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/sign-in'); // Or wherever your login page is
        }
    }, [isLoading, user, navigate]);

    // Determine current section based on URL
    const getSection = () => {
        if (location.pathname.includes('/player')) return 'player';
        if (location.pathname.includes('/organiser')) return 'organiser';
        if (location.pathname.includes('/creator')) return 'creator';
        return 'player';
    };

    const section = getSection();
    const steps = onboardingSteps[section as keyof typeof onboardingSteps];

    const [searchParams] = useSearchParams();
    const currentStepId = searchParams.get("step");

    // Helper to determine step status
    const getStepStatus = (stepId: string, allSteps: typeof steps) => {
        // If no step param, assume first step is active
        const activeStepId = currentStepId || allSteps[0].id;
        const activeIndex = allSteps.findIndex(s => s.id === activeStepId);
        const stepIndex = allSteps.findIndex(s => s.id === stepId);

        return {
            isActive: stepId === activeStepId,
            isCompleted: stepIndex < activeIndex
        };
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f0b15] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!user) return null; // Should redirect via useEffect

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] flex flex-col md:flex-row relative items-start">
            {/* Sidebar Navigation - Desktop */}
            <aside className="hidden md:flex w-80 flex-col p-8 sticky top-24 text-gray-200 z-30 ml-4">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Onboarding</h2>
                    <p className="text-sm text-gray-400 mt-1 capitalize">{section} Setup</p>
                </div>

                <nav className="space-y-6 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-2 bottom-4 w-0.5 bg-[#3d3551] -z-10" />

                    {steps.map((step) => {
                        const Icon = step.icon;
                        const { isActive, isCompleted } = getStepStatus(step.id, steps);

                        return (
                            <div key={step.id} className="flex gap-4 relative bg-transparent group">
                                <div className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                                    isActive ? "border-[#8B5CF6] bg-[#8B5CF6] text-white shadow-lg shadow-purple-500/20" :
                                        isCompleted ? "border-[#8B5CF6] bg-[#8B5CF6] text-white" :
                                            "border-[#3d3551] bg-[#13111c]/50 text-gray-400"
                                )}>
                                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                </div>
                                <div className="flex flex-col pt-0.5">
                                    <span className={cn(
                                        "text-sm font-medium leading-none transition-colors",
                                        isActive ? "text-white" : "text-gray-400"
                                    )}>
                                        {step.title}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {step.description}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </nav>
            </aside>


            {/* Mobile Header */}
            <header className="md:hidden border-b border-[#3d3551] bg-[#13111c]/95 backdrop-blur supports-[backdrop-filter]:bg-[#13111c]/60 p-4 flex items-center justify-between sticky top-16 z-40 w-full text-white">
                <div>
                    <h2 className="font-semibold text-lg capitalize">{section} Setup</h2>
                    {/* Simple progress bar for mobile */}
                    <div className="h-1 w-32 bg-[#3d3551] rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-[#8B5CF6] w-1/4" />
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:text-purple-400">
                    Exit
                </Button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 border-l min-h-screen border-[#3d3551] w-full min-w-0 transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default OnboardingLayout;

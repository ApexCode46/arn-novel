
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, } from "@/components/ui/scroll-area";
import {
    User,
    Mail,
    Calendar,
    Edit2,
    Camera,
    BookOpen,
    Heart,
    Eye,
    Coins,
    Trophy,
    Save,
    X,
    Loader2,
    UserPlus,
    Lock,
    Upload,
    EyeOff
} from "lucide-react";

// Interface สำหรับข้อมูลผู้ใช้
interface UserProfile {
    id: string;
    name: string;
    email: string;
    image?: string;
    penName?: string;
    bio?: string;
    website?: string;
    location?: string;
    joinedAt: string;
    role: string;
    wallet?: {
        balance: number;
    };
    stats: {
        storiesWritten: number;
        chaptersWritten: number;
        totalViews: number;
        totalFavorites: number;
        totalFollowers: number;
        totalFollowing: number;
    };
}

// Interface สำหรับเรื่องที่เขียน
interface UserStory {
    story_id: string;
    title: string;
    blurb?: string;
    verticalImage?: string;
    views: number;
    status: string;
    created_at: string;
    updated_at: string;
    category?: string;
    contentLevel?: string;
    tags?: string[];
    totalChapters: number;
    totalFavorites: number;
    totalFollows: number;
}

// Interface สำหรับรายการโปรด
interface FavoriteStory {
    favorite_id: string;
    created_at: string;
    story: {
        story_id: string;
        title: string;
        blurb?: string;
        verticalImage?: string;
        views: number;
        status: string;
        user: {
            name: string;
            penName?: string;
        };
    };
}

// Interface สำหรับกำลังติดตาม
interface FollowingStory {
    follow_id: string;
    followed_at: string;
    story: {
        story_id: string;
        title: string;
        blurb?: string;
        verticalImage?: string;
        views: number;
        status: string;
        totalChapters: number;
        totalFavorites: number;
        user: {
            name: string;
            penName?: string;
        };
    };
}

// Interface สำหรับ Extended Session
interface ExtendedUser {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
    wallet?: {
        balance: number;
    };
}

interface ExtendedSession {
    user?: ExtendedUser;
    expires?: string;
}

export default function ProfilePage() {
    const { data: session, status, update } = useSession() as {
        data: ExtendedSession | null;
        status: "loading" | "authenticated" | "unauthenticated";
        update: () => Promise<ExtendedSession | null>;
    };
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Additional states for new features
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Data states for different tabs
    const [userStories, setUserStories] = useState<UserStory[]>([]);
    const [favoriteStories, setFavoriteStories] = useState<FavoriteStory[]>([]);
    const [followingStories, setFollowingStories] = useState<FollowingStory[]>([]);
    const [tabLoading, setTabLoading] = useState({
        stories: false,
        favorites: false,
        following: false
    });

    // Form data for editing (เฉพาะ field ที่มีใน schema)
    const [formData, setFormData] = useState({
        name: "",
    });

    // Password change form data
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Password visibility states
    const [passwordVisibility, setPasswordVisibility] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Fetch user profile data
    useEffect(() => {
        const fetchProfile = async () => {
            if (status === "authenticated" && session?.user) {
                try {
                    setLoading(true);
                    const userId = session.user.id || session.user.email;

                    const response = await fetch(`/api/users/profile/${encodeURIComponent(userId as string)}`);

                    if (response.ok) {
                        const data = await response.json();
                        setProfile(data.profile);
                        // Set form data for editing (เฉพาะ field ที่แก้ไขได้)
                        setFormData({
                            name: data.profile.name || "",
                        });
                    } else {
                        console.log("Failed to fetch profile");
                    }
                } catch (error) {
                    console.log("Error fetching profile:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProfile();
    }, [status, session]);

    // Fetch data for specific tabs
    const fetchTabData = async (tabType: 'stories' | 'favorites' | 'following') => {
        if (!session?.user) return;

        try {
            setTabLoading(prev => ({ ...prev, [tabType]: true }));
            const userId = session.user.id || session.user.email;
            const response = await fetch(`/api/users/profile/${encodeURIComponent(userId as string)}/${tabType}`);

            if (response.ok) {
                const data = await response.json();
                switch (tabType) {
                    case 'stories':
                        setUserStories(data.stories || []);
                        break;
                    case 'favorites':
                        setFavoriteStories(data.favorites || []);
                        break;
                    case 'following':
                        setFollowingStories(data.following || []);
                        break;
                }
            }
        } catch (error) {
            console.log(`Error fetching ${tabType}:`, error);
        } finally {
            setTabLoading(prev => ({ ...prev, [tabType]: false }));
        }
    };

    // Handle form input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle password form changes
    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Toggle password visibility
    const togglePasswordVisibility = (field: keyof typeof passwordVisibility) => {
        setPasswordVisibility(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Handle image file selection
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("ไฟล์รูปต้องมีขนาดไม่เกิน 5MB");
                return;
            }

            // Check file type
            if (!file.type.startsWith("image/")) {
                alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
                return;
            }

            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload profile image
    const handleImageUpload = async () => {
        if (!imageFile || !session?.user) return;

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('userId', session.user.id || session.user.email as string);

            const response = await fetch('/api/users/profile/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();

                // Update profile with new image
                setProfile(prev => prev ? { ...prev, image: data.imageUrl } : null);

                // Reset image states
                setImageFile(null);
                setImagePreview(null);

                // Update session
                await update();

                alert("อัปโหลดรูปโปรไฟล์สำเร็จ");
            } else {
                const errorData = await response.json();
                alert(`เกิดข้อผิดพลาด: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("เกิดข้อผิดพลาดในการอัปโหลดรูป");
        } finally {
            setUploadingImage(false);
        }
    };

    // Change password
    const handleChangePassword = async () => {
        if (!session?.user) return;

        // Validate password
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
            return;
        }

        try {
            setSaving(true);
            const userId = session.user.id || session.user.email;

            const response = await fetch('/api/users/profile/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (response.ok) {
                alert("เปลี่ยนรหัสผ่านสำเร็จ");
                setChangePasswordMode(false);
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                setPasswordVisibility({
                    currentPassword: false,
                    newPassword: false,
                    confirmPassword: false,
                });
            } else {
                const errorData = await response.json();
                alert(`เกิดข้อผิดพลาด: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
        } finally {
            setSaving(false);
        }
    };

    // Save profile changes
    const handleSaveProfile = async () => {
        if (!session?.user) return;

        try {
            setSaving(true);
            const userId = session.user.id || session.user.email;

            const response = await fetch(`/api/users/profile/${encodeURIComponent(userId as string)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
                setEditMode(false);
                // Update session if name changed
                if (formData.name !== session.user.name) {
                    await update();
                }
            } else {
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        } catch (error) {
            console.log("Error saving profile:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูل");
        } finally {
            setSaving(false);
        }
    };

    const handleToHomePage = () => {
        router.push("/");
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">กำลังโหลดข้อมูล...</span>
            </div>
        );
    }

    // Error state
    if (!profile) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">ไม่พบข้อมูลโปรไฟล์</h2>
                    <Button onClick={() => window.location.reload()}>ลองใหม่อีกครั้ง</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Button variant="default" className="mb-4" onClick={handleToHomePage}>
                    กลับหน้าหลัก
                </Button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview */}
                <div className="lg:col-span-1">
                    <Card className="bg-backgroundCustom shadow-md">
                        <CardHeader className="text-center pb-2">
                            <div className="relative mx-auto mb-4">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center relative">
                                    {imagePreview ? (
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : profile.image ? (
                                        <Image
                                            src={profile.image}
                                            alt={profile.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <User className="w-16 h-16 text-gray-400" />
                                    )}
                                    {uploadingImage && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {/* Image upload controls */}
                                <div className="absolute bottom-0 right-0 flex gap-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="profile-image-upload"
                                        disabled={uploadingImage}
                                    />
                                    <label htmlFor="profile-image-upload">
                                        <Button
                                            size="sm"
                                            className="rounded-full p-2 h-8 w-8"
                                            disabled={uploadingImage}
                                            asChild
                                        >
                                            <span>
                                                <Camera className="w-4 h-4" />
                                            </span>
                                        </Button>
                                    </label>

                                    {imageFile && (
                                        <Button
                                            size="sm"
                                            className="rounded-full p-2 h-8 w-8"
                                            onClick={handleImageUpload}
                                            disabled={uploadingImage}
                                        >
                                            <Upload className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <CardTitle className="text-xl">
                                {profile.name}
                                {profile.penName && (
                                    <div className="text-sm text-muted-foreground font-normal mt-1">
                                        ปากกา: {profile.penName}
                                    </div>
                                )}
                            </CardTitle>

                            <CardDescription className="flex items-center justify-center gap-1 mt-2">
                                <Mail className="w-4 h-4" />
                                {profile.email}
                            </CardDescription>

                            {profile.role && (
                                <Badge variant="secondary" className="mt-2">
                                    {profile.role === 'admin' ? 'ผู้ดูแลระบบ' :
                                        profile.role === 'writer' ? 'นักเขียน' : 'ผู้อ่าน'}
                                </Badge>
                            )}
                        </CardHeader>

                        <CardContent>
                            {profile.bio && (
                                <div className="mb-4">
                                    <h4 className="font-semibold mb-2">เกี่ยวกับฉัน</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {profile.bio}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2 text-sm">
                                {profile.location && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">ที่อยู่:</span>
                                        <span className="text-muted-foreground">{profile.location}</span>
                                    </div>
                                )}

                                {profile.website && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">เว็บไซต์:</span>
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {profile.website}
                                        </a>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-muted-foreground">
                                        เข้าร่วมเมื่อ {new Date(profile.joinedAt).toLocaleDateString('th-TH')}
                                    </span>
                                </div>

                                {profile.wallet && (
                                    <div className="flex items-center gap-2 mt-4 p-3 bg-yellow-50 dark:bg-background rounded-lg">
                                        <Coins className="w-4 h-4 text-yellow-600" />
                                        <span className="font-medium">เหรียญคงเหลือ:</span>
                                        <span className="font-bold text-yellow-600">
                                            {profile.wallet.balance.toLocaleString()} เหรียญ
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <Button
                                    onClick={() => setEditMode(true)}
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    แก้ไขโปรไฟล์
                                </Button>

                                <Button
                                    onClick={() => setChangePasswordMode(true)}
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    เปลี่ยนรหัสผ่าน
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="stats" className="w-full" onValueChange={(value) => {
                        if (value === 'stories' && userStories.length === 0 && !tabLoading.stories) {
                            fetchTabData('stories');
                        } else if (value === 'favorites' && favoriteStories.length === 0 && !tabLoading.favorites) {
                            fetchTabData('favorites');
                        } else if (value === 'following' && followingStories.length === 0 && !tabLoading.following) {
                            fetchTabData('following');
                        }
                    }}>
                        <TabsList className="grid w-full grid-cols-4 bg-backgroundCustom shadow-sm">
                            <TabsTrigger value="stats">สถิติ</TabsTrigger>
                            <TabsTrigger value="stories">เรื่องของฉัน</TabsTrigger>
                            <TabsTrigger value="favorites">รายการโปรด</TabsTrigger>
                            <TabsTrigger value="following">กำลังติดตาม</TabsTrigger>
                        </TabsList>

                        {/* Stats Tab */}
                        <TabsContent value="stats" className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <Card className="bg-backgroundCustom shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">เรื่องที่เขียน</CardTitle>
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{profile.stats.storiesWritten}</div>
                                        <p className="text-xs text-muted-foreground">เรื่อง</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-backgroundCustom shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">ตอนที่เขียน</CardTitle>
                                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{profile.stats.chaptersWritten}</div>
                                        <p className="text-xs text-muted-foreground">ตอน</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-backgroundCustom shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">การดูทั้งหมด</CardTitle>
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{profile.stats.totalViews.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">ครั้ง</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-backgroundCustom shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">รายการโปรด</CardTitle>
                                        <Heart className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{profile.stats.totalFavorites}</div>
                                        <p className="text-xs text-muted-foreground">เรื่อง</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-backgroundCustom shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">ผู้ติดตาม</CardTitle>
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{profile.stats.totalFollowers}</div>
                                        <p className="text-xs text-muted-foreground">คน</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-backgroundCustom shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">กำลังติดตาม</CardTitle>
                                        <Trophy className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{profile.stats.totalFollowing}</div>
                                        <p className="text-xs text-muted-foreground">คน</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Stories Tab */}
                        <TabsContent value="stories">
                            <Card className="bg-backgroundCustom shadow-sm">
                                <CardHeader>
                                    <CardTitle>เรื่องที่เขียน</CardTitle>
                                    <CardDescription>รายการนิยายทั้งหมดที่คุณเขียน</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {tabLoading.stories ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                            <span className="ml-2">กำลังโหลด...</span>
                                        </div>
                                    ) : userStories.length > 0 ? (
                                        <ScrollArea className="h-120 sm:h-80 w-full bg-backgroundCustom border rounded">
                                            <div className="space-y-4">
                                                {userStories.map((story) => (
                                                    <div key={story.story_id} className="border rounded-lg p-4  hover:bg-secondary/80 shadow-sm transition-transform duration-300">
                                                        <div className="flex gap-4">
                                                            <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                                                                {story.verticalImage ? (
                                                                    <Image
                                                                        src={story.verticalImage}
                                                                        alt={story.title}
                                                                        width={64}
                                                                        height={80}
                                                                        className="object-cover rounded"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-lg">{story.title}</h3>
                                                                {story.blurb && (
                                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                        {story.blurb}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                                    <span className="flex items-center gap-1">
                                                                        <Eye className="w-4 h-4" />
                                                                        {story.views.toLocaleString()}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <BookOpen className="w-4 h-4" />
                                                                        {story.totalChapters}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Heart className="w-4 h-4" />
                                                                        {story.totalFavorites}
                                                                    </span>
                                                                    <Badge variant={story.status === 'published' ? 'default' : 'secondary'}>
                                                                        {story.status === 'published' ? 'เผยแพร่' :
                                                                            story.status === 'draft' ? 'แบบร่าง' : 'สิ้นสุด'}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    อัปเดตล่าสุด: {new Date(story.updated_at).toLocaleDateString('th-TH')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <BookOpen className="mx-auto h-12 w-12 mb-4" />
                                            <p>ยังไม่มีเรื่องที่เขียน</p>
                                            <Button className="mt-4" onClick={() => window.open('/writer', '_blank')}>เริ่มเขียนเรื่องแรก</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Favorites Tab */}
                        <TabsContent value="favorites">
                            <Card className="bg-backgroundCustom shadow-sm">
                                <CardHeader>
                                    <CardTitle>รายการโปรด</CardTitle>
                                    <CardDescription>เรื่องที่คุณชื่นชอบ</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {tabLoading.favorites ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                            <span className="ml-2">กำลังโหลด...</span>
                                        </div>
                                    ) : favoriteStories.length > 0 ? (
                                        <div className="space-y-4">
                                            {favoriteStories.map((favorite) => (
                                                <div key={favorite.favorite_id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <div className="flex gap-4">
                                                        <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                                                            {favorite.story.verticalImage ? (
                                                                <Image
                                                                    src={favorite.story.verticalImage}
                                                                    alt={favorite.story.title}
                                                                    width={64}
                                                                    height={80}
                                                                    className="object-cover rounded"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <BookOpen className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-lg">{favorite.story.title}</h3>
                                                            <div className="text-sm text-muted-foreground">
                                                                โดย {favorite.story.user.penName || favorite.story.user.name}
                                                            </div>
                                                            {favorite.story.blurb && (
                                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                    {favorite.story.blurb}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Eye className="w-4 h-4" />
                                                                    {favorite.story.views.toLocaleString()}
                                                                </span>
                                                                <Badge variant={favorite.story.status === 'published' ? 'default' : 'secondary'}>
                                                                    {favorite.story.status === 'published' ? 'เผยแพร่' :
                                                                        favorite.story.status === 'draft' ? 'แบบร่าง' : 'สิ้นสุด'}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                เพิ่มในรายการโปรด: {new Date(favorite.created_at).toLocaleDateString('th-TH')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Heart className="mx-auto h-12 w-12 mb-4" />
                                            <p>ยังไม่มีเรื่องในรายการโปรด</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* following Tab */}
                        <TabsContent value="following">
                            <Card className="bg-backgroundCustom shadow-sm">
                                <CardHeader>
                                    <CardTitle>กำลังติดตาม</CardTitle>
                                    <CardDescription>เรื่องที่คุณกำลังติดตาม</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {tabLoading.following ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                            <span className="ml-2">กำลังโหลด...</span>
                                        </div>
                                    ) : followingStories.length > 0 ? (
                                        <div className="space-y-4">
                                            {followingStories.map((follow) => (
                                                <div key={follow.follow_id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <div className="flex gap-4">
                                                        <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                                                            {follow.story.verticalImage ? (
                                                                <Image
                                                                    src={follow.story.verticalImage}
                                                                    alt={follow.story.title}
                                                                    width={64}
                                                                    height={80}
                                                                    className="object-cover rounded"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <BookOpen className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-lg">{follow.story.title}</h3>
                                                            <div className="text-sm text-muted-foreground">
                                                                โดย {follow.story.user.penName || follow.story.user.name}
                                                            </div>
                                                            {follow.story.blurb && (
                                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                    {follow.story.blurb}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Eye className="w-4 h-4" />
                                                                    {follow.story.views.toLocaleString()}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <BookOpen className="w-4 h-4" />
                                                                    {follow.story.totalChapters} ตอน
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Heart className="w-4 h-4" />
                                                                    {follow.story.totalFavorites}
                                                                </span>
                                                                <Badge variant={follow.story.status === 'published' ? 'default' : 'secondary'}>
                                                                    {follow.story.status === 'published' ? 'เผยแพร่' :
                                                                        follow.story.status === 'draft' ? 'แบบร่าง' : 'สิ้นสุด'}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                เริ่มติดตาม: {new Date(follow.followed_at).toLocaleDateString('th-TH')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <UserPlus className="mx-auto h-12 w-12 mb-4" />
                                            <p>ยังไม่มีเรื่องที่คุณกำลังติดตาม</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Change Password Dialog */}
            <Dialog open={changePasswordMode} onOpenChange={setChangePasswordMode}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
                        <DialogDescription>
                            กรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="currentPassword" className="text-right">
                                รหัสผ่านปัจจุบัน
                            </Label>
                            <div className="col-span-3 relative">
                                <Input
                                    id="currentPassword"
                                    type={passwordVisibility.currentPassword ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    className="pr-10"
                                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => togglePasswordVisibility('currentPassword')}
                                >
                                    {passwordVisibility.currentPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newPassword" className="text-right">
                                รหัสผ่านใหม่
                            </Label>
                            <div className="col-span-3 relative">
                                <Input
                                    id="newPassword"
                                    type={passwordVisibility.newPassword ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    className="pr-10"
                                    placeholder="กรอกรหัสผ่านใหม่"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => togglePasswordVisibility('newPassword')}
                                >
                                    {passwordVisibility.newPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="confirmPassword" className="text-right">
                                ยืนยันรหัสผ่าน
                            </Label>
                            <div className="col-span-3 relative">
                                <Input
                                    id="confirmPassword"
                                    type={passwordVisibility.confirmPassword ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    className="pr-10"
                                    placeholder="ยืนยันรหัสผ่านใหม่"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                >
                                    {passwordVisibility.confirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <ul className="list-disc list-inside space-y-1">
                                <li>รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</li>
                                <li>ควรใช้ตัวอักษรและตัวเลขผสมกัน</li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setChangePasswordMode(false);
                                setPasswordData({
                                    currentPassword: "",
                                    newPassword: "",
                                    confirmPassword: "",
                                });
                                setPasswordVisibility({
                                    currentPassword: false,
                                    newPassword: false,
                                    confirmPassword: false,
                                });
                            }}
                            disabled={saving}
                        >
                            <X className="w-4 h-4 mr-2" />
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleChangePassword}
                            disabled={
                                saving ||
                                !passwordData.currentPassword ||
                                !passwordData.newPassword ||
                                !passwordData.confirmPassword
                            }
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Lock className="w-4 h-4 mr-2" />
                            )}
                            เปลี่ยนรหัสผ่าน
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Profile Dialog */}
            <Dialog open={editMode} onOpenChange={setEditMode}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>แก้ไขโปรไฟล์</DialogTitle>
                        <DialogDescription>
                            แก้ไขข้อมูลส่วนตัวของคุณ
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                ชื่อ
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="col-span-3"
                            />
                        </div>

                        <div className="text-sm text-muted-foreground text-center">
                            <p>ข้อมูลอื่นๆ เช่น นามปากกา, ที่อยู่, เว็บไซต์ และข้อมูลส่วนตัว</p>
                            <p>จะเปิดให้แก้ไขในอนาคต</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditMode(false)}
                            disabled={saving}
                        >
                            <X className="w-4 h-4 mr-2" />
                            ยกเลิก
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={saving}>
                            {saving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            บันทึก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
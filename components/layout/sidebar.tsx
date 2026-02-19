"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
    LayoutDashboard,
    Route,
    Users,
    Truck,
    FileText,
    Heart,
    Settings,
    ChevronLeft,
    ChevronRight,
    Brain,
    AlertTriangle,
    Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, ai: false },
    { href: "/viaggi", label: "Viaggi", icon: Route, ai: false },
    { href: "/ai-dispatch", label: "AI Dispatch", icon: Sparkles, ai: true },
    { href: "/autisti", label: "Autisti", icon: Users, ai: false },
    { href: "/veicoli", label: "Veicoli", icon: Truck, ai: false },
    { href: "/documenti", label: "Documenti", icon: FileText, ai: false },
    { href: "/benessere", label: "Benessere", icon: Heart, ai: false },
]

const bottomNavItems = [
    { href: "/impostazioni", label: "Impostazioni", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                "relative flex flex-col h-screen border-r border-border transition-all duration-300 ease-in-out",
                "bg-sidebar",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo */}
            <div className={cn(
                "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
                collapsed && "justify-center px-2"
            )}>
                <div className="flex-shrink-0 w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Brain className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <p className="text-sm font-bold text-foreground leading-none">Logistic</p>
                        <p className="text-xs font-bold text-gradient leading-none mt-0.5">Brain</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                item.ai
                                    ? isActive
                                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                                        : "text-violet-400/80 hover:bg-violet-500/10 hover:text-violet-300 border border-transparent hover:border-violet-500/20"
                                    : isActive
                                        ? "bg-sidebar-primary/15 text-sidebar-primary border border-sidebar-primary/20"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                collapsed && "justify-center px-2"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon className={cn(
                                "w-5 h-5 flex-shrink-0 transition-colors",
                                item.ai
                                    ? isActive ? "text-violet-300" : "text-violet-400/70 group-hover:text-violet-300"
                                    : isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                            )} />
                            {!collapsed && (
                                <span className="animate-fade-in flex items-center gap-1.5">
                                    {item.label}
                                    {item.ai && !isActive && (
                                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/20 leading-none">
                                            AI
                                        </span>
                                    )}
                                </span>
                            )}
                            {isActive && !collapsed && (
                                <div className={cn(
                                    "ml-auto w-1.5 h-1.5 rounded-full",
                                    item.ai ? "bg-violet-400" : "bg-sidebar-primary"
                                )} />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Alert badge */}
            {!collapsed && (
                <div className="mx-3 mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-amber-400">4 Alert Attivi</p>
                            <p className="text-xs text-amber-400/70">Documenti in scadenza</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom nav */}
            <div className="px-2 pb-4 space-y-1 border-t border-sidebar-border pt-4">
                {bottomNavItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                collapsed && "justify-center px-2"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span className="animate-fade-in">{item.label}</span>}
                        </Link>
                    )
                })}
            </div>

            {/* Collapse button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors shadow-md z-10"
            >
                {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
        </aside>
    )
}

import { login, signup } from './actions'
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string; message?: string }> }) {
    const searchParams = await props.searchParams;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans">
            <div className="w-full max-w-md">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-telc-red to-red-600 text-white font-extrabold text-3xl shadow-lg mb-4 transform -rotate-3">
                        t
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Sign in to access your B2 Exam Simulator
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-8">
                        {searchParams?.error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-md flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-700 dark:text-red-300">
                                    <p className="font-medium">Authentication Error!</p>
                                    <p>{searchParams.error}</p>
                                </div>
                            </div>
                        )}

                        {searchParams?.message && (
                            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-6 rounded-r-md flex items-start gap-3">
                                <Mail className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-green-700 dark:text-green-300">
                                    <p className="font-medium">Success!</p>
                                    <p>{searchParams.message}</p>
                                </div>
                            </div>
                        )}

                        <form className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-telc-blue transition-colors" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-telc-blue/50 focus:border-telc-blue text-gray-900 dark:text-white transition-all duration-200"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-telc-blue transition-colors" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-telc-blue/50 focus:border-telc-blue text-gray-900 dark:text-white transition-all duration-200"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-3">
                                <button
                                    formAction={login}
                                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-telc-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-telc-blue transition-all duration-200 transform hover:scale-[1.02]"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Sign In
                                </button>
                                <button
                                    formAction={signup}
                                    className="w-full flex justify-center items-center py-2.5 px-4 border-2 border-telc-blue/20 rounded-xl text-sm font-bold text-telc-blue dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-telc-blue transition-all duration-200"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-8">
                    &copy; {new Date().getFullYear()} Deutsch B2 Exam Simulator. All rights reserved.
                </p>
            </div>
        </div>
    )
}

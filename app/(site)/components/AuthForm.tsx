'use client';
import axios from 'axios'
import Button from '@/app/components/Button';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from "next/navigation"
import { 
    useForm,
    FieldValues,
    SubmitHandler
} from 'react-hook-form';
import {BsGithub, BsGoogle} from "react-icons/bs"
import Input from '@/app/components/inputs/Input';
import AuthSocialButton from './AuthSocialButton';
import { toast } from 'react-hot-toast';
import { signIn, useSession } from 'next-auth/react';

type Variant = "LOGIN" | 'REGISTER';

const AuthForm = () => {
    const [variant, setVariant] = useState<Variant>('LOGIN')
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const session = useSession()

    useEffect(()=>{
        if(session.status === 'authenticated') {
            router.push('/users')
        }
    },[router, session?.status])

    const toggleVariant = useCallback(()=>{
        if(variant === 'LOGIN') {
            setVariant('REGISTER');
        } 
        if(variant === 'REGISTER') {
            setVariant('LOGIN')
        }
    },[])

    const {
        register,
        handleSubmit,
        formState : { errors }
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email:'',
            password:''
        }
    });

    const onSubmit:SubmitHandler<FieldValues> = data => {
        setIsLoading(true);

        if(variant === 'REGISTER') {
            axios.post('/api/register', data)
                .then(()=> signIn('credentials', {...data,  redirect:false}))
                .catch((error)=> {
                    console.log(error)
                    toast.error(error?.response?.data);
                })
                .finally(()=> setIsLoading(false));
        } 
        if(variant === 'LOGIN') {
            signIn('credentials',{
                ...data,
                redirect : false,
            })
            .then((callback)=> {
                console.log(callback);
                if(callback?.error) {
                    toast.error(callback?.error);
                    return;
                }
                if(callback?.ok) {
                    router.push('/users');
                    toast.success(data.email + '님 로그인 했습니다.');
                }
            })
            .finally(()=> setIsLoading(false));

        }
    } 

    const socailAction = (action:string) => {
        setIsLoading(true);
    }

    return (
        <div
            className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
        >
            <div className='bg-white px-4 py-8 shadow sm:rounded-md sm:px-8'>

                <form
                    className='space-y-6'
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {variant === 'REGISTER' && (
                        <Input
                            label='Name'
                            register={register}
                            id="name"
                            errors={errors}/>
                    )}
                    <Input
                        type='email'
                        label='Email Address'
                        register={register}
                        id="email"
                        errors={errors}/>
                    <Input
                        type='password'
                        label='Password'
                        register={register}
                        id="password"
                        errors={errors}/>
                    <div>
                        <Button
                            disabled={isLoading}
                            fullWidth
                            type='submit'
                        >
                            {variant === 'LOGIN'? 'Sign In' : 'Register'}
                        </Button>
                    </div>
                </form>


                <div className='mt-6'>
                    <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-gray-300'/>
                        </div>
                        <div className='relative flex justify-center text-sm'>
                            <span className='bg-white px-2 text-gray-500'>
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className='mt-6 flex gap-2'>
                        <AuthSocialButton
                            icon={BsGithub}
                            onClick={()=> socailAction('github')}
                        />
                        <AuthSocialButton
                            icon={BsGoogle}
                            onClick={()=> socailAction('google')}
                        />
                    </div>

                    <div className='flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500'>
                        <div>
                            {variant === 'LOGIN' ? 'New to Messenger ?': 'Already have an account?'}
                        </div>
                        <div onClick={toggleVariant} className='underline cursor-pointer'>
                            {variant === 'LOGIN' ? 'Create an account': 'Login'}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AuthForm
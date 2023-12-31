'use client';

import Modal from "@/app/components/Modal";
import { User } from "@prisma/client";
import axios from "axios";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from 'next/navigation'
import { toast } from "react-hot-toast";
import Input from "@/app/components/inputs/Input";
import Select from "@/app/components/inputs/Select";
import Button from "@/app/components/Button";

interface GroupModalProps {
    isOpen?: boolean;
    onClose:()=>void;
    users: User[]
}

const GroupChatModal:React.FC<GroupModalProps> = ({
    isOpen,
    onClose,
    users = []
}) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState:{ errors }
    } = useForm({
        defaultValues: {
            name:'',
            members:[]
        }
    })
 
    const members = watch('members')

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true)

        axios.post('/api/conversations',{
            ...data,
            isGroup:true
        })
        .then(()=>{
            router.refresh();
            onClose();
        })
        .catch(()=> toast.error('다시 시도 해주세요.'))
        .finally(()=>setIsLoading(false))
    } 

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="font-base font-semibold leading-7 text-gray-900">
                            그룹 채팅 만들기
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">최소 2명 이상 그룹 채팅방을 만들어 주세요.</p>
                        <div className="mt-10 flex flex-col gap-y-8">
                            <Input 
                                disabled={isLoading}
                                label="채팅 방 이름"
                                id="name"
                                errors={errors}
                                register={register}
                            />
                            <Select
                                disabled={isLoading}
                                label="채팅 멤버"
                                options={users.map((user) => ({ 
                                    value: user.id, 
                                    label: user.name 
                                  }))} 
                                  onChange={(value) => setValue('members', value, { 
                                    shouldValidate: true 
                                  })} 
                                value={members}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <Button disabled={isLoading} onClick={onClose} type="button" secondary>취소</Button>
                    <Button disabled={isLoading}  type="submit">만들기</Button>
                </div>
            </form>
        </Modal>
    )
}

export default GroupChatModal
'use clinet';

import { User } from "@prisma/client";
import Modal from "../Modal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import {useRouter} from "next/navigation";
import { toast } from "react-hot-toast";
import Input from "../inputs/Input";
import Image from "next/image"
import { CldUploadButton } from "next-cloudinary";
import Button from "../Button";

interface SettingModalProps {
    isOpen?:boolean;
    onClose: ()=>void;
    user: User
}

const SettingsModal:React.FC<SettingModalProps> = ({
    isOpen,
    onClose,
    user
}) => {

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors}
    } = useForm({
        defaultValues: {
            name: user?.name,
            image: user?.image
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()
    const image = watch('image'); 

    const handleUpload = (result:any) => setValue('image', result?.info?.secure_url, { shouldValidate: true});

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true)

        axios.post(`/api/settings`,data)
            .then(()=>{
                router.refresh();
                onClose()
            })
            .catch(()=> toast.error('업데이트를 완료 하지 못했습니다.'))
            .finally(()=> setIsLoading(false))
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-12">
                    <h2 className="text-base font-semibold leading-7 text-gray-900">프로필</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">프로필 정보를 변경해보세요.</p>
                    <div className="mt-12 flex flex-col gap-y-8">
                        <Input 
                            disabled={isLoading}
                            label="이름"
                            id="name"
                            errors={errors}
                            required
                            register={register}
                        />
                        <div>
                            <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">
                                프로필 사진
                            </label>
                            <div className="mt-2 flex items-center gap-3">
                                <Image 
                                    alt="Avatar"
                                    width="46"
                                    height="46"
                                    className="rounded-full"
                                    src={image || user?.image || "/images/placeholder.jpg"}
                                />
                                <CldUploadButton
                                    options={{maxFiles:1}}
                                    onUpload={handleUpload}
                                    uploadPreset="xzivg1ue"
                                >
                                    <Button disabled={isLoading} secondary type="button">업데이트</Button>
                                </CldUploadButton>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <Button secondary onClick={onClose}>취소</Button>
                    <Button disabled={isLoading} type="submit">저장하기</Button>
                </div>
            </form>

        </Modal>
    )
}

export default SettingsModal
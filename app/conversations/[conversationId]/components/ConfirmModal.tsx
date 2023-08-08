'use client'

import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import useConversation from "@/app/hooks/useConversations";
import { Dialog } from "@headlessui/react";
import axios from "axios";
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { FiAlertTriangle } from "react-icons/fi"

interface ConfirmModalProps {
    isOpen?: boolean;
    onClose:()=>void
}

const ConfirmModal:React.FC<ConfirmModalProps> = ({isOpen, onClose}) => {
    const router = useRouter();
    const { conversationId } = useConversation();
    const [isLoading, setIsLoading] = useState(false)

    const onDelete = useCallback(()=>{
        setIsLoading(true);

        axios.delete(`/api/conversations/${conversationId}`)
            .then(()=>{
                onClose();
                router.push('/conversations')
                router.refresh();
            })
            .catch(()=> toast.error('삭제를 완료하지 못했습니다.'))
            .finally(()=> setIsLoading(false));
    },[conversationId, router, onClose])
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="sm:flex sm:items-start">
                <div className="mt-3 mx-auto flex h-12 w-12 flex-shrink-0 justify-center items-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiAlertTriangle className="h-6 w-6 text-red-600 "/>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        대화방 삭제
                    </Dialog.Title>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">현재 대화방을 정말 삭제 하시겠습니까?</p>
                    </div>
                </div>
            </div>
            <div className="mt-5 flex flex-row-reverse sm:mt-4 sm:justify-center">
                <Button disabled={isLoading} danger onClick={onDelete}>삭제</Button>
                <Button disabled={isLoading} secondary onClick={onClose}>취소</Button>
            </div>
        </Modal>
    )
}

export default ConfirmModal
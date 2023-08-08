'use client';

import { HiPaperAirplane, HiPhoto } from "react-icons/hi2"
import MessageInput from "./MessageInput"
import { 
    FieldValues, 
    SubmitHandler, 
    useForm 
  } from "react-hook-form";
  import axios from "axios";
import useConversation from "@/app/hooks/useConversations";
import { CldUploadButton} from 'next-cloudinary'

const Form = () => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: {
            errors,
        }
        } = useForm<FieldValues>({
        defaultValues: {
            message: ''
        }
    });

  const { conversationId } = useConversation();
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue('message','',{shouldValidate: true});

    axios.post('/api/messages',{
        ...data,
        conversationId
    })
  }

  const handleUpload = (result:any) => {
    axios.post('/api/messages',{
      image: result?.info?.secure_url,
      conversationId
    })
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 border-t w-full">
        <CldUploadButton
          options={{ maxFiles: 1}}
          onUpload={handleUpload}
          uploadPreset="xzivg1ue"
        >
          <HiPhoto size={30} className="text-sky-500 cursor-pointer"/>
        </CldUploadButton>
        <form className="flex items-center gap-3 w-full" onSubmit={handleSubmit(onSubmit)}>
            <MessageInput type="text" id="message" register={register} placeholder="메시지를 보내세요." errors={errors}/>
            <button type="submit" className="rounded-full p-1 bg-sky-500">
                <HiPaperAirplane size={24} className=" text-white cursor-pointer"/>
            </button>
        </form>
    </div>
  )
}

export default Form
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  AlertDescription,
  Button,
  Checkbox,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Spinner,
} from '@react-monorepo/ui'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import type { RegisterPayload } from '../../apis/auth'
import eyeIcon from '../../assets/auth/eye.svg'
import lockIcon from '../../assets/auth/lock.svg'
import mailIcon from '../../assets/auth/mail.svg'
import AuthShell from '../../components/auth/AuthShell'
import SocialAuth from '../../components/auth/SocialAuth'
import {
  registerSchema,
  type RegisterFormValues,
} from '../../features/auth/authSchemas'
import {
  clearAuthError,
  registerAccount,
} from '../../features/auth/authSlice'
import {
  useAppDispatch,
  useAppSelector,
} from '../../store/hooks'

function Register() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const authStatus = useAppSelector((state) => state.auth.status)
  const errorMessage = useAppSelector(
    (state) => state.auth.errorMessage,
  )

  const isSubmitting = authStatus === 'submitting'

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  function clearOldRequestError(): void {
    if (errorMessage.length > 0) {
      dispatch(clearAuthError())
    }
  }

  async function handleSubmit(
    values: RegisterFormValues,
  ): Promise<void> {
    const payload: RegisterPayload = {
      name: values.name,
      email: values.email,
      password: values.password,
    }

    const resultAction = await dispatch(registerAccount(payload))

    if (registerAccount.fulfilled.match(resultAction)) {
      navigate('/', { replace: true })
    }
  }

  return (
    <AuthShell mode="register" title="註冊港伴">
      {errorMessage.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form noValidate onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="auth-register-fields grid gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-name" className="sr-only">
                    用戶名稱
                  </FieldLabel>
                  <Input
                    {...field}
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    placeholder="用戶名稱"
                    className="auth-register-input h-12 rounded-lg border-[#dddddd] bg-white px-4 text-base shadow-none placeholder:text-[#6a6a6a] focus-visible:border-[#222222] focus-visible:ring-1 focus-visible:ring-[#222222]"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => {
                      field.onChange(event)
                      clearOldRequestError()
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-email" className="sr-only">
                    電郵地址
                  </FieldLabel>
                  <div className="relative">
                    <img
                      src={mailIcon}
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
                    />
                    <Input
                      {...field}
                      id="register-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="電郵地址"
                      className="auth-register-input h-12 rounded-lg border-[#dddddd] bg-white pr-4 pl-12 text-base shadow-none placeholder:text-[#6a6a6a] focus-visible:border-[#222222] focus-visible:ring-1 focus-visible:ring-[#222222]"
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      onChange={(event) => {
                        field.onChange(event)
                        clearOldRequestError()
                      }}
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-password" className="sr-only">
                    密碼
                  </FieldLabel>
                  <div className="relative">
                    <img
                      src={lockIcon}
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
                    />
                    <Input
                      {...field}
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="密碼（至少 8 位，包含字母及數字）"
                      className="auth-register-input h-12 rounded-lg border-[#dddddd] bg-white pr-14 pl-12 text-base shadow-none placeholder:text-[#6a6a6a] focus-visible:border-[#222222] focus-visible:ring-1 focus-visible:ring-[#222222]"
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      onChange={(event) => {
                        field.onChange(event)
                        clearOldRequestError()
                      }}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full hover:bg-[#f7f7f7] focus-visible:outline-2 focus-visible:outline-[#222222]"
                      aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                      aria-pressed={showPassword}
                      onClick={() => {
                        setShowPassword(!showPassword)
                      }}
                    >
                      <img
                        src={eyeIcon}
                        alt=""
                        aria-hidden="true"
                        className="size-6"
                      />
                    </button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="register-confirm-password"
                    className="sr-only"
                  >
                    確認密碼
                  </FieldLabel>
                  <Input
                    {...field}
                    id="register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="再次輸入密碼"
                    className="auth-register-input h-12 rounded-lg border-[#dddddd] bg-white px-4 text-base shadow-none placeholder:text-[#6a6a6a] focus-visible:border-[#222222] focus-visible:ring-1 focus-visible:ring-[#222222]"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => {
                      field.onChange(event)
                      clearOldRequestError()
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }}
          />

          <Controller
            name="acceptTerms"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#666666]">
                    <Checkbox
                      checked={field.value}
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true)
                        clearOldRequestError()
                      }}
                      className="mt-0.5 size-5 rounded-[4px] border-[#555555]"
                    />
                    <span>我已閱讀並同意服務條款和私隱政策</span>
                  </label>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }}
          />
        </div>

        <Button
          type="submit"
          className="auth-register-button mt-4 h-12 w-full rounded-lg bg-primary !text-base !font-medium text-white shadow-none hover:bg-[#e00b41]"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? '正在註冊' : '註冊'}
        </Button>
      </form>

      <SocialAuth
        accountPrompt="已有帳戶？"
        accountAction="立即登入"
        accountHref="/login"
        providerAction="註冊"
      />
    </AuthShell>
  )
}

export default Register

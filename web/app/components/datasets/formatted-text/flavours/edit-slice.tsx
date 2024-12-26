import { useState } from 'react'
import type { FC, ReactNode } from 'react'
import { FloatingFocusManager, autoUpdate, flip, shift, useDismiss, useFloating, useHover, useInteractions, useRole } from '@floating-ui/react'
import { RiDeleteBinLine } from '@remixicon/react'
import type { SliceProps } from './type'
import { SliceContainer, SliceContent, SliceDivider, SliceLabel } from './shared'
import classNames from '@/utils/classnames'
import ActionButton, { ActionButtonState } from '@/app/components/base/action-button'

type EditSliceProps = SliceProps<{
  label: ReactNode
  onDelete: () => void
  labelInnerClassName?: string
  contentClassName?: string
  showDivider?: boolean
}>

export const EditSlice: FC<EditSliceProps> = (props) => {
  const {
    label,
    className,
    text,
    onDelete,
    labelInnerClassName,
    contentClassName,
    showDivider = true,
    ...rest
  } = props
  const [delBtnShow, setDelBtnShow] = useState(false)
  const [isDelBtnHover, setDelBtnHover] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: delBtnShow,
    onOpenChange: setDelBtnShow,
    placement: 'right',
    whileElementsMounted: autoUpdate,
    middleware: [
      flip(),
      shift(),
    ],
  })
  const hover = useHover(context, {})
  const dismiss = useDismiss(context)
  const role = useRole(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss, role])

  const isDestructive = delBtnShow && isDelBtnHover

  return (
    <span className='inline-block'>
      <SliceContainer {...rest}
        className={className}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <SliceLabel
          className={classNames(
            isDestructive && '!bg-state-destructive-solid !text-text-primary-on-surface',
          )}
          labelInnerClassName={labelInnerClassName}
        >
          {label}
        </SliceLabel>
        <SliceContent
          className={classNames(
            isDestructive && '!bg-state-destructive-hover-alt',
            contentClassName,
          )}
        >
          {text}
        </SliceContent>
        {showDivider && <SliceDivider
          className={classNames(
            isDestructive && '!bg-state-destructive-hover-alt',
          )}
        />}
        {delBtnShow && <FloatingFocusManager
          context={context}
        >
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className='p-1 rounded-lg bg-components-actionbar-bg shadow flex items-center justify-center'
            onMouseEnter={() => setDelBtnHover(true)}
            onMouseLeave={() => setDelBtnHover(false)}
          >
            <ActionButton
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
                setDelBtnShow(false)
              }}
              state={ActionButtonState.Destructive}
            >
              <RiDeleteBinLine className='w-4 h-4' />
            </ActionButton>
          </div>
        </FloatingFocusManager>}
      </SliceContainer>
    </span>
  )
}
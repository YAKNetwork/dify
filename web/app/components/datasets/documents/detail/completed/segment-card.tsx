import React, { type FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiDeleteBinLine, RiEditLine } from '@remixicon/react'
import { StatusItem } from '../../list'
import { useDocumentContext } from '../index'
import ChildSegmentList from './child-segment-list'
import Tag from './common/tag'
import Dot from './common/dot'
import { SegmentIndexTag } from './common/segment-index-tag'
import { useSegmentListContext } from './index'
import type { ChildChunkDetail, SegmentDetailModel } from '@/models/datasets'
import Indicator from '@/app/components/header/indicator'
import Switch from '@/app/components/base/switch'
import Divider from '@/app/components/base/divider'
import { formatNumber } from '@/utils/format'
import Confirm from '@/app/components/base/confirm'
import cn from '@/utils/classnames'
import Badge from '@/app/components/base/badge'
import { isAfter } from '@/utils/time'
import Tooltip from '@/app/components/base/tooltip'

type ISegmentCardProps = {
  loading: boolean
  detail?: SegmentDetailModel & { document?: { name: string } }
  onClick?: () => void
  onChangeSwitch?: (enabled: boolean, segId?: string) => Promise<void>
  onDelete?: (segId: string) => Promise<void>
  onDeleteChildChunk?: (segId: string, childChunkId: string) => Promise<void>
  handleAddNewChildChunk?: (parentChunkId: string) => void
  onClickSlice?: (childChunk: ChildChunkDetail) => void
  onClickEdit?: () => void
  className?: string
  archived?: boolean
  embeddingAvailable?: boolean
}

const SegmentCard: FC<ISegmentCardProps> = ({
  detail = {},
  onClick,
  onChangeSwitch,
  onDelete,
  onDeleteChildChunk,
  handleAddNewChildChunk,
  onClickSlice,
  onClickEdit,
  loading = true,
  className = '',
  archived,
  embeddingAvailable,
}) => {
  const { t } = useTranslation()
  const {
    id,
    position,
    enabled,
    content,
    word_count,
    hit_count,
    answer,
    keywords,
    child_chunks = [],
    created_at,
    updated_at,
  } = detail as Required<ISegmentCardProps>['detail']
  const [showModal, setShowModal] = useState(false)
  const isCollapsed = useSegmentListContext(s => s.isCollapsed)
  const [mode, parentMode] = useDocumentContext(s => [s.mode, s.parentMode])

  const isGeneralMode = useMemo(() => {
    return mode === 'custom'
  }, [mode])

  const isParentChildMode = useMemo(() => {
    return mode === 'hierarchical'
  }, [mode])

  const isFullDocMode = useMemo(() => {
    return mode === 'hierarchical' && parentMode === 'full-doc'
  }, [mode, parentMode])

  const chunkEdited = useMemo(() => {
    if (mode === 'hierarchical' && parentMode === 'full-doc')
      return false
    return isAfter(updated_at * 1000, created_at * 1000)
  }, [mode, parentMode, updated_at, created_at])

  const textOpacity = useMemo(() => {
    return enabled ? '' : 'opacity-50 group-hover/card:opacity-100'
  }, [enabled])

  const handleClickCard = useCallback(() => {
    if (mode !== 'hierarchical' || parentMode !== 'full-doc')
      onClick?.()
  }, [mode, parentMode, onClick])

  const renderContent = () => {
    if (answer) {
      return (
        <>
          <div className='flex'>
            <div className='w-4 mr-2 text-[13px] font-medium leading-[20px] text-text-tertiary'>Q</div>
            <div className='text-text-secondary body-md-regular'>{content}</div>
          </div>
          <div className='flex'>
            <div className='w-4 mr-2 text-[13px] font-medium leading-[20px] text-text-tertiary'>A</div>
            <div className='text-text-secondary body-md-regular'>{answer}</div>
          </div>
        </>
      )
    }
    return content
  }

  const wordCountText = useMemo(() => {
    const total = formatNumber(word_count)
    return `${total} ${t('datasetDocuments.segment.characters', { count: word_count })}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word_count])

  const labelPrefix = useMemo(() => {
    return isParentChildMode ? t('datasetDocuments.segment.parentChunk') : t('datasetDocuments.segment.chunk')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParentChildMode])

  return (
    <div
      className={cn('w-full px-3 rounded-xl group/card', isFullDocMode ? '' : 'pt-2.5 pb-2 hover:bg-dataset-chunk-detail-card-hover-bg', className)}
      onClick={handleClickCard}
    >
      <div className='h-5 relative flex items-center justify-between'>
        <>
          <div className='flex items-center gap-x-2'>
            <SegmentIndexTag positionId={position} className={textOpacity} labelPrefix={labelPrefix} />
            <Dot />
            <div className={cn('text-text-tertiary system-xs-medium', textOpacity)}>{wordCountText}</div>
            <Dot />
            <div className={cn('text-text-tertiary system-xs-medium', textOpacity)}>{`${formatNumber(hit_count)} ${t('datasetDocuments.segment.hitCount')}`}</div>
            {chunkEdited && (
              <>
                <Dot />
                <Badge text={t('datasetDocuments.segment.edited') as string} uppercase className={textOpacity} />
              </>
            )}
          </div>
          {!isFullDocMode
            ? <div className='flex items-center'>
              {loading
                ? (
                  <Indicator color="gray" />
                )
                : (
                  <>
                    <StatusItem status={enabled ? 'enabled' : 'disabled'} reverse textCls="text-text-tertiary system-xs-regular" />
                    {embeddingAvailable && (
                      <div className="absolute -top-2 -right-2.5 z-20 hidden group-hover/card:flex items-center gap-x-0.5 p-1
                      rounded-[10px] border-[0.5px] border-components-actionbar-border bg-components-actionbar-bg shadow-md backdrop-blur-[5px]">
                        {!archived && (
                          <>
                            <Tooltip
                              popupContent='Edit'
                              popupClassName='text-text-secondary system-xs-medium'
                            >
                              <div
                                className='shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-state-base-hover cursor-pointer'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onClickEdit?.()
                                }}>
                                <RiEditLine className='w-4 h-4 text-text-tertiary' />
                              </div>
                            </Tooltip>
                            <Tooltip
                              popupContent='Delete'
                              popupClassName='text-text-secondary system-xs-medium'
                            >
                              <div className='shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-state-destructive-hover cursor-pointer group/delete'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowModal(true)
                                }
                                }>
                                <RiDeleteBinLine className='w-4 h-4 text-text-tertiary group-hover/delete:text-text-destructive' />
                              </div>
                            </Tooltip>
                            <Divider type="vertical" className="h-3.5 bg-divider-regular" />
                          </>
                        )}
                        <div
                          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            e.stopPropagation()
                          }
                          className="flex items-center"
                        >
                          <Switch
                            size='md'
                            disabled={archived || detail.status !== 'completed'}
                            defaultValue={enabled}
                            onChange={async (val) => {
                              await onChangeSwitch?.(val, id)
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
            </div>
            : null}
        </>
      </div>
      {loading
        ? (
          <div className=''>
            <div className='' />
          </div>
        )
        : (
          <>
            <div className={cn('text-text-secondary body-md-regular -tracking-[0.07px] mt-0.5',
              textOpacity,
              isFullDocMode ? 'line-clamp-3' : isCollapsed ? 'line-clamp-2' : 'line-clamp-20',
            )}>
              {renderContent()}
            </div>
            {isGeneralMode && <div className={cn('flex items-center gap-x-2 py-1.5', textOpacity)}>
              {keywords?.map(keyword => <Tag key={keyword} text={keyword} />)}
            </div>}
            {
              isFullDocMode
                ? <button className='mt-0.5 mb-2 text-text-accent system-xs-semibold-uppercase' onClick={() => onClick?.()}>{t('common.operation.viewMore')}</button>
                : null
            }
            {
              child_chunks.length > 0
              && <ChildSegmentList
                parentChunkId={id}
                childChunks={child_chunks}
                enabled={enabled}
                onDelete={onDeleteChildChunk!}
                handleAddNewChildChunk={handleAddNewChildChunk}
                onClickSlice={onClickSlice}
              />
            }
          </>
        )
      }
      {showModal
        && <Confirm
          isShow={showModal}
          title={t('datasetDocuments.segment.delete')}
          confirmText={t('common.operation.sure')}
          onConfirm={async () => { await onDelete?.(id) }}
          onCancel={() => setShowModal(false)}
        />
      }
    </div>
  )
}

export default React.memo(SegmentCard)
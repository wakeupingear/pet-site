import React from 'react'

interface Props {
    active?: boolean,
    onClick?: (e: React.MouseEvent<HTMLElement>) => void,
    text?: string,
}

export default function Button({
    active = true,
    onClick,
    text
}:Props) {
  return (
    <div className={'button ' + (active && 'buttonActive')} onClick={onClick}>{text}</div>
  )
}

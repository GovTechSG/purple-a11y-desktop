const ToolTip = ({description, id, showToolTip}) => {
    return (
        <>
        {showToolTip && 
            <div role="tooltip" className='custom-tooltip' id={id}>
                <div className="custom-tooltip-description"><span className="visually-hidden">Tooltip</span>{description}</div>
                <div className="custom-tooltip-arrow"></div>
            </div>
        }
        </>
    )
}

export default ToolTip;


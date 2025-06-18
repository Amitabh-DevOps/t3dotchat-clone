import React from 'react'

const ModifyResponse = () => {
  return (
    <div
      className={`${updateLoader && "dropdown-loader pointer-events-none "
        } p-[3px] bg-rtlLight dark:bg-rtlDark rounded-xl shadow-md absolute z-50`}
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
      }}
      ref={dropdownRef}
    >
      <div className=" flex flex-col rounded-xl p-3 bg-rtlLight dark:bg-rtlDark max-h-52 overflow-hidden">
        <input
          ref={inputRef}
          onKeyDown={(e) => {
            e.key === "Enter" && handlePrompt("Custom");
          }}
          type="text"
          className="p-2 rounded-lg w-full outline-none "
          placeholder="Modify with a prompt"
        />
        <div className="flex flex-col mt-2 flex-grow overflow-y-auto">
          {Object.keys(PROMPT_TYPES).map((type) => (
            <button
              onClick={() => handlePrompt(type as keyof typeof PROMPT_TYPES)}
              className="p-1 px-2 rounded-lg hover:bg-accentGray/10 outline-none text-left text-sm"
              key={type}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModifyResponse
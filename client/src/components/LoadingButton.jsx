import React from 'react'

function LoadingButton({classButton , buttonTitle }) {
  return (
<button className="btn btn-primary" type="button" disabled>
  <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
  <span role="status">Loading...</span>
</button>
  )
}

export default LoadingButton

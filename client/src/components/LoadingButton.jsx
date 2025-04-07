import React from 'react'

function LoadingButton({classButton , buttonTitle }) {
  return (
<button class="btn btn-primary" type="button" disabled>
  <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
  <span role="status">Loading...</span>
</button>
  )
}

export default LoadingButton

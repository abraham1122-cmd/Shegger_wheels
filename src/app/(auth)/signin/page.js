




import Link from "next/link"

export default function signinPage(){

    return(
    <>
        <h3>signIn</h3>

        <form className="form-section">

            <div className="form-group">
                <input
                type="text"
                name="email"
                id="email"
                placeholder="Enter your email"
                required
                />

                <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"

                required
                />

            </div>
            
              <button type="submit">Signin</button>
        </form>


        <p className="mb"


        >Don't have account?{""}

        <a href="/signUp" className="font-semibold text-rde-500 hover:underline">

        signUp
        
        </a>
        
        
        </p>

       <Link href="/" className="text-center bg-red-500">

       Back to Home
       
       </Link>
    </>
    )
}
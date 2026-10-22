

export default function signUpPage(){

    return(
        <>

        <div className="signup-form">

           <form className="for-group">

            <input
            type="text"
            name="name"
            id="name"
            placeholder="Enter your full name"
            required
            />

            <input
            type="email"
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

            <input
            type="password"
            name="password"
            id="password"
            placeholder="confirm your password"
            required
            />

           </form>

           <div className="">
            <input
            type="checkbox"
            id="terms"
            required
            className=""
            />
            <label htmlFor="terms" className="">
                I agree to{""}
                <a href="#" className="">
                    Terms and Conditions
                </a>
            </label>
           </div>

           <button type="submit" >signUp</button>
        </div>
        
        
        </>
    )
}
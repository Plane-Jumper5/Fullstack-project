import { useState, useEffect } from "react";
import { useFormik, FieldArray } from "formik";
import * as Yup from "yup";
import axios from "axios";
import styles from "./AddRecipeForm.module.css";

const availableIngredients = [
  "Sugar",
  "Salt",
  "Flour",
  "Milk",
  "Butter",
  "Eggs",
  "Oil",
  "Pepper",
  "Garlic",
 
];

const initialValues = {
  title: "",
  shortDescription: "",
  cookingTime: "",
  calories: "",
  category: "",
  instruction: "",
  ingredients: [],
  newIngredientName: "",
  newIngredientAmount: "",
};

const validationSchema = Yup.object({
  title: Yup.string().required("Recipe Title is required"),
  shortDescription: Yup.string().required("Description is required"),
  cookingTime: Yup.number()
    .typeError("Must be a number")
    .required("Cooking time is required"),
  calories: Yup.number().nullable(),
  category: Yup.string().required("Category is required"),
  instruction: Yup.string().required("Instructions are required"),
  ingredients: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().required("Name required"),
        amount: Yup.string().required("Amount required"),
      })
    )
    .min(1, "At least one ingredient required"),
});

export default function AddRecipeForm() {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendURL = "https://your-backend-api.com/api/recipes"; 

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!photo) {
        alert("Please upload a photo");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("shortDescription", values.shortDescription);
      formData.append("cookingTime", values.cookingTime);
      formData.append("calories", values.calories || "");
      formData.append("category", values.category);
      formData.append("instruction", values.instruction);
      formData.append("photo", photo);
      formData.append("ingredients", JSON.stringify(values.ingredients));

      try {
        setLoading(true);
        await axios.post(backendURL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Recipe successfully submitted!");
        resetForm();
        setPhoto(null);
      } catch (error) {
        console.error("❌ Error submitting recipe:", error);
        alert("❌ Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 2 * 1024 * 1024) {
      setPhoto(file);
    } else {
      alert("Image must be under 2MB");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={formik.handleSubmit} className={styles.form}>
      
        <div className={styles.left}>
          <h1 className={styles.addRecipeTitle}>Add Recipe</h1>
          <p className={styles.generalInformation}>General Information</p>

          <div className={styles.fieldGroup}>
            <label htmlFor="title" className={styles.recipeTitleLabel}>
              Recipe Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Enter the name of your recipe"
              className={styles.input}
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.title && formik.errors.title && (
              <div className={styles.error}>{formik.errors.title}</div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="shortDescription" className={styles.label}>
              Recipe Description
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              placeholder="Enter a brief description of your recipe"
              className={styles.textarea}
              value={formik.values.shortDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.shortDescription && formik.errors.shortDescription && (
              <div className={styles.error}>{formik.errors.shortDescription}</div>
            )}
          </div>

          <div className={styles.cookingTimeWrapper}>
            <div className={styles.fieldGroup}>
              <label htmlFor="cookingTime" className={styles.label}>
                Cooking time in minutes
              </label>
              <input
                id="cookingTime"
                name="cookingTime"
                type="number"
                className={styles.input}
                value={formik.values.cookingTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.cookingTime && formik.errors.cookingTime && (
                <div className={styles.error}>{formik.errors.cookingTime}</div>
              )}
            </div>

            <div className={styles.caloriesCategoryRow}>
              <div className={styles.fieldGroup}>
                <label htmlFor="calories" className={styles.label}>
                  Calories
                </label>
                <input
                  id="calories"
                  name="calories"
                  type="number"
                  placeholder="Optional"
                  className={styles.input}
                  value={formik.values.calories}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.calories && formik.errors.calories && (
                  <div className={styles.error}>{formik.errors.calories}</div>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="category" className={styles.label}>
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className={styles.select}
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select</option>
                  <option value="Soup">Soup</option>
                  <option value="Salad">Salad</option>
                  <option value="Dessert">Dessert</option>
                </select>
                {formik.touched.category && formik.errors.category && (
                  <div className={styles.error}>{formik.errors.category}</div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.ingredients}>
            <label className={styles.ingredientsLabel}>Ingredients</label>

            <div className={styles.ingredientsLabelsRow}>
              <span className={styles.labelName}>Name</span>
              <span className={styles.labelAmount}>Amount</span>
              <span style={{ width: "20px" }}></span>
            </div>

            <FieldArray
              name="ingredients"
              render={(arrayHelpers) => (
                <>
                  {formik.values.ingredients.map((item, index) => (
                    <div key={index} className={styles.ingredientRow}>
                      <select
                        name={`ingredients.${index}.name`}
                        value={item.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={styles.ingredientNameSelect}
                      >
                        <option value="">Select ingredient</option>
                        {availableIngredients.map((ingr) => (
                          <option key={ingr} value={ingr}>
                            {ingr}
                          </option>
                        ))}
                      </select>

                      <input
                        name={`ingredients.${index}.amount`}
                        value={item.amount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={styles.ingredientAmountInput}
                        placeholder="Amount"
                      />

                      <button
                        type="button"
                        onClick={() => arrayHelpers.remove(index)}
                        className={styles.removeBtn}
                        title="Remove ingredient"
                      >
                        ❌
                      </button>
                    </div>
                  ))}

                  <div className={styles.newIngredientInputs}>
                    <select
                      value={formik.values.newIngredientName}
                      onChange={(e) =>
                        formik.setFieldValue("newIngredientName", e.target.value)
                      }
                      className={styles.input}
                    >
                      <option value="">Select ingredient</option>
                      {availableIngredients.map((ingr) => (
                        <option key={ingr} value={ingr}>
                          {ingr}
                        </option>
                      ))}
                    </select>

                    <div className={styles.amountAndButton}>
                      <input
                        value={formik.values.newIngredientAmount}
                        onChange={(e) =>
                          formik.setFieldValue("newIngredientAmount", e.target.value)
                        }
                        placeholder="Amount"
                        className={styles.input}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const name = formik.values.newIngredientName.trim();
                          const amount = formik.values.newIngredientAmount.trim();
                          if (name && amount) {
                            arrayHelpers.push({ name, amount });
                            formik.setFieldValue("newIngredientName", "");
                            formik.setFieldValue("newIngredientAmount", "");
                          }
                        }}
                        className={styles.addIngredientBtn}
                      >
                        Add new Ingredient
                      </button>
                    </div>
                  </div>
                </>
              )}
            />
            {formik.errors.ingredients && (
              <div className={styles.error}>{formik.errors.ingredients}</div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="instruction" className={styles.instructionsLabel}>
              Instructions
            </label>
            <textarea
              id="instruction"
              name="instruction"
              placeholder="Enter a text"
              className={styles.instructionsTextarea}
              value={formik.values.instruction}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.instruction && formik.errors.instruction && (
              <div className={styles.error}>{formik.errors.instruction}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.publishRecipeBtn}
          >
            {loading ? "Submitting..." : "Publish Recipe"}
          </button>
        </div>

        <div className={styles.uploadContainer}>
          <label htmlFor="photoInput" className={styles.photoLabel}>
            Upload photo

            <div className={styles.photoBox}>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className={styles.previewImage}
                />
              ) : (
                <>
                  <svg
                    className={styles.uploadIcon}
                    aria-hidden="true"
                    width="161.79"
                    height="136"
                    style={{ position: "absolute", top: 119, left: 114.6 }}
                    role="img"
                  >
                    <use xlinkHref="#icon-photo" />
                  </svg>
                  <span className={styles.photoPlaceholder}>Click to upload</span>
                </>
              )}
            </div>
          </label>
          <input
            id="photoInput"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className={styles.hiddenInput}
          />
        </div>
      </form>
    </div>
  );
}